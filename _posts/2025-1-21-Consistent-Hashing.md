---
layout: post
title: An implementation of Consistent Hashing in Java
---

Hello Folks, Now anyone who's done some level of learning system design questions will have come across the concept of Consistent Hashing. While it's always been easy to explain the concept, I've found it hard to reason about the implementation many times.

Nothing like writing a good ol' blog post to help solidify my understanding. I hope this post helps you understand the concept of Consistent Hashing and how to implement it in a programming language like Java.

# What is Consistent Hashing?

Let's start with a simple example. You have a set of servers and you'd like to distribute data across them. A simple and reasonable technique to do this is to hash the key of the data that you are storing. Let's say you have a hash of the key. You could now do key modulus number of servers to get a server index. So let's say, your key is "hello" and you have 3 servers, you'd get a server index of 2. You now know that the key "hello" should be stored on server 2.

Using the same logic, you could now retrieve the key "hello" from server 2, again using the same hash function.

<div style="text-align: center; margin: 20px 0;">
  <img src="{{ site.baseurl }}/images/consistent-hashing/traditional_hashing.png" alt="traditional-hashing">
  <p><em>Figure 1. Traditional hashing</em></p>
</div>

Now this is all good and works well, but what happens when you add a new server?

## The Problem with Traditional Hashing

When a new server is added or an existing server is removed, the hash of the keys will change. This means that the key "hello" will now be stored on a different server according to the hash function. 

Thus when the client makes the request to retrieve the key "hello", the modulus operation could now return a different server index. This means that the client will now need to make a request to a different server to retrieve the key "hello".

To rectify this, we now have to go through the entire key space across all servers and move the keys to their correct server after recomputing the hash function on each key. This is a very expensive operation and is not scalable when we are talking about billions of keys and a large number of servers.

This is where Consistent Hashing comes in. Consistent Hashing is a technique that allows us to distribute data across a cluster of servers in a way that minimizes the number of keys that need to be moved when a server is added or removed from the cluster.

Thus for distributed data systems that store billions of K-V pairs, consistent hashing is a more elegant solution.

## How does Consistent Hashing work?

Let's assume you have 3 servers to add to your cluster. You'd first hash the servers and get a hash value for each server. These hash values will be stored in a logical ring. 

Now when you want to store a key, you'd hash the key which will also map to a location on the ring. You'd then find the server that's closest to the location that was hashed. The closest server in clockwise direction is the server that will store the key and it's value.

<div style="text-align: center; margin: 15px 0;">
  <img src="{{ site.baseurl }}/images/consistent-hashing/hash_ring_hashing_to_server.png" alt="key-hashing-to-server">
  <p><em>Figure 2. Key hashing to a server</em></p>
</div>

