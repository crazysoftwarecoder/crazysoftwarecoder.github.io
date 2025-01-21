---
layout: post
title: An implementation of Consistent Hashing in Java
---

Hello Folks, Now anyone who's done some level of learning system design questions will have come across the concept of Consistent Hashing. While it's always been easy to explain the concept, I've found it hard to reason about the implementation many times.

Nothing like writing a good ol' blog post to help solidify my understanding. I hope this post helps you understand the concept of Consistent Hashing and how to implement it in a programming language like Java.

# What is Consistent Hashing?

Let's start with a simple example. You have a set of servers and you'd like to distribute data across them. A simple and reasonable technique to do this is to hash the key of the data that you are storing. Let's say you have a hash of the key. You could now do key modulus number of servers to get a server index. So let's say, your key is "hello" and you have 3 servers, you'd get a server index of 2. You now know that the key "hello" should be stored on server 2.

Using the same logic, you could now retrieve the key "hello" from server 2, again using the same hash function.

Now this is all good and works well, but what happens when you add a new server?


![_config.yml]({{ site.baseurl }}/images/config.png)

The easiest way to make your first post is to edit this one. Go into /_posts/ and update the Hello World markdown file. For more instructions head over to the [Jekyll Now repository](https://github.com/barryclark/jekyll-now) on GitHub.