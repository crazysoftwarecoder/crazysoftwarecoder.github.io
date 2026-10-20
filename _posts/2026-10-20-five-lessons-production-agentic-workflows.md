---
layout: post
date: 2026-10-20
title: "Five Things to Remember When Building Production-Grade Agentic Workflows"
tags: [ai, llm, agents, software-engineering, architecture]
excerpt: "Demos of LLM agents are easy. Running one in production, where a wrong answer costs money and someone has to explain it afterwards, is a different job. Five lessons that cost me time or money to learn."
comments: true
---

Over the last couple of years I've spent most of my time building agentic systems, including one that helps brokers work through loan scenarios at a large bank. The demo version of an agent is easy to build. A model, a handful of tools, a loop, and you have something that looks remarkably smart in a 10 minute walkthrough.

Production is a different job. In production the agent runs thousands of times a day on inputs nobody scripted, every wrong answer has a cost, and when something goes wrong someone has to explain exactly what happened. Most of what I know about this I learned by getting it wrong first. Here are the five lessons I'd hand to anyone starting out, roughly in the order they bit me.

## 1. The model orchestrates and explains. It does not do maths or apply policy.

The first version of our agent had the lending rules in the prompt and asked the model to work out serviceability from them. It was right most of the time. In a bank, "most of the time" is a disaster. A model that computes the right number 95% of the time is a model that gives a customer the wrong answer one time in twenty, and you cannot audit why, because the reasoning lives inside a forward pass you can't inspect.

The fix was a hard rule that has held up on every project since: every number and every rule lives in deterministic code. The model's job is to gather inputs, decide which calculation or policy check to call, and explain the result in plain language. It never does the arithmetic and it never decides whether a rule applies.

This sounds like it limits the agent. In practice it makes the agent more useful. Compliance can read the rule table because it's data, not prose buried in a prompt. When a rule changes you change one row and ship, instead of re-tuning a prompt and hoping nothing else moved. And when a broker disputes an answer you can show them the exact rule and the exact inputs that produced it.

The broader principle: the model is good at language and bad at being a calculator or a rulebook. Use it for what it's good at and give the rest to code you can test.

## 2. Bound every loop, because the model will not bound itself.

The classic agent loop is: call the model, it picks a tool, run the tool, feed the result back, repeat until the model says it's done. The problem is the "until". Left to itself, an agent that gets a partial or empty result from a tool will try again with slightly different arguments. And again. The pattern I've seen more than once is a tool returning "no results" and the model trying forty variations of the query before giving up.

This is a cost problem first. One prompt change or one tweaked tool description can push the average steps per turn from four to thirty, and because you only notice when the bill arrives, it can run for days. It's also a latency problem, because a user waiting on a thirty step turn has long since closed the tab.

Three things fixed it for us:

- **A step budget per turn.** The graph enforces it, not the prompt. When the budget runs out the agent stops and tells the user what it has and what it couldn't get.
- **Idempotency keys on tool calls.** The same tool with the same arguments in the same turn returns the cached result for free. Repeated calls become harmless instead of expensive.
- **An alert on steps-per-turn at p99.** This is the one that actually catches regressions. Average steps hide a long tail; the p99 doesn't.

If you only take one thing from this post, take this one. An unbounded agent loop is the fastest way I know to turn a reasonable model budget into an unreasonable one overnight.

## 3. State is a structured object, not the transcript. The graph decides when you're done.

Two mistakes that look separate but share a root cause.

The first is sending the whole conversation back to the model on every turn. Cost grows with the square of the conversation length, and long transcripts make the model worse, not better. Important facts from turn two get drowned out by turn fifteen's chatter.

The second is trusting the model to say when it has enough information. Models are confident. They will happily announce "I now have everything I need" with half the required fields missing, and then produce a polished answer built on gaps.

Both fix the same way. The source of truth for a conversation is a typed state object: the fields you've collected, the ones you still need, the decisions made so far. The model gets that state plus a rolling summary of the conversation, not the raw transcript. And readiness is a property of the state, decided by the graph: if the required fields are present, move to the next phase. If they aren't, keep gathering. The model's opinion on whether it's done is just one more input, and not a very reliable one.

This also makes debugging possible. When something goes wrong you can look at the state at each step and see exactly what the agent knew. Try doing that with a 40 message transcript.

## 4. Tools are an interface for the model. Design them like one.

Early on I treated tools as thin wrappers over existing services. Same names, same parameters, a one line description. "Gets loan information." Then I spent days debugging what looked like the model being stupid: calling tools at the wrong time, with the wrong arguments, or hallucinating around a failure. It wasn't the model. It was the interface.

Three changes made the biggest difference:

- **Descriptions written for the model, including when not to call.** "Returns the applicant's current liabilities. Do not call until the applicant's identity has been confirmed. Returns an empty list if none exist, which is a valid answer and not an error." The when-not-to-call guidance cut the misfires more than anything else.
- **Enums instead of free text.** If a parameter has six valid values, make it an enum. Free text invites the model to invent a seventh.
- **Structured errors the model can act on.** A tool that fails by returning a Java stack trace gives the model two bad options: apologise to the user or make something up. A tool that returns `{ "error": "MISSING_FIELD", "field": "dependants", "hint": "ask the user" }` gives it a path forward.

One more thing in the same vein. Don't stuff every tool into every call. Thirty tool definitions with long descriptions is thousands of tokens of overhead before the user says anything, and the model picks wrong more often when the menu is bigger. Expose only the tools that are valid for the current phase of the graph. The information gathering step doesn't need the product catalogue.

## 5. No prompt change without evals, and build the evals from real traffic.

This is the biggest time sink I've seen on every agent project, including my own. Someone changes a prompt to fix one case a stakeholder complained about. It silently breaks three others. Nobody notices for a week, and by then two more prompt changes have landed on top of it.

The fix is unglamorous: an eval suite that runs in CI, and a rule that nobody touches a prompt without it going green. The suite doesn't have to be huge to be useful. A few hundred cases with expected outcomes catches most regressions, and it means that when you do improve something you can say by how much. A claimed improvement without a measurement is just a vibe.

The part people get wrong is where the eval cases come from. The natural instinct is to build them from the demo script, which is also the happy path. Our happy path was a salaried applicant with one income and no complications, and it worked beautifully. Self-employed applicants, guarantors and trust income, which are a large share of real volume, were a mess, and we didn't know because nothing was measuring them. Build the eval set from the distribution of real traffic, and weight it towards the cases that are expensive to get wrong.

If you use a model as the judge, calibrate it. Grade a set by hand, measure how often the judge agrees with the humans, and re-check every time the judge model changes. An uncalibrated judge drifts, and the team ends up chasing noise.

## The pattern

Every one of these lessons is really the same lesson. The model is one component in a system, and it's the least predictable one. Everything around it, the state, the loop, the tools, the rules, the tests, exists to make the system reliable despite that. The teams that struggle are the ones who treat the model as the system. The teams that ship are the ones who treat it as a very capable, slightly unreliable colleague, and build the scaffolding accordingly.
