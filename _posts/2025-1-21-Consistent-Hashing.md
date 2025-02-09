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

## Implementation in Java

Let's implement a consistent hashing system in Java. We'll create a class that handles the consistent hashing logic and provides methods to add/remove servers and get the server for a given key.

Here's the complete implementation:

```java
import java.util.Collection;
import java.util.SortedMap;
import java.util.TreeMap;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

public class ConsistentHash<T> {
    // The number of virtual nodes per server
    private final int numberOfReplicas;
    // The hash ring
    private final SortedMap<Integer, T> circle = new TreeMap<>();
    
    public ConsistentHash(int numberOfReplicas, Collection<T> nodes) {
        this.numberOfReplicas = numberOfReplicas;
        for (T node : nodes) {
            addNode(node);
        }
    }
    
    public void addNode(T node) {
        for (int i = 0; i < numberOfReplicas; i++) {
            // Create virtual nodes for each real node
            circle.put(hash(node.toString() + i), node);
        }
    }
    
    public void removeNode(T node) {
        for (int i = 0; i < numberOfReplicas; i++) {
            circle.remove(hash(node.toString() + i));
        }
    }
    
    public T getNode(Object key) {
        if (circle.isEmpty()) {
            return null;
        }
        
        int hash = hash(key.toString());
        
        // If the hash is not in the circle, get the first node after it
        if (!circle.containsKey(hash)) {
            SortedMap<Integer, T> tailMap = circle.tailMap(hash);
            hash = tailMap.isEmpty() ? circle.firstKey() : tailMap.firstKey();
        }
        
        return circle.get(hash);
    }
    
    private int hash(String key) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(key.getBytes());
            // Use the first 4 bytes for the hash
            return ((digest[3] & 0xFF) << 24) |
                   ((digest[2] & 0xFF) << 16) |
                   ((digest[1] & 0xFF) << 8) |
                   (digest[0] & 0xFF);
        } catch (NoSuchAlgorithmException e) {
            // Fallback to a simpler hash function
            return key.hashCode();
        }
    }
}
```

Let's break down the key components of this implementation:

1. **Virtual Nodes**: We create multiple virtual nodes for each physical server to ensure better distribution. This is controlled by the `numberOfReplicas` parameter.

2. **Hash Ring**: We use a `TreeMap` to represent our hash ring. The keys are the hash values, and the values are the server nodes.

3. **Hash Function**: We use MD5 for hashing, taking the first 4 bytes to create an integer hash value. This provides a good distribution of values.

Here's how to use the implementation:

```java
public class ConsistentHashingExample {
    public static void main(String[] args) {
        // Create some server nodes
        List<String> servers = new ArrayList<>();
        servers.add("server1.example.com");
        servers.add("server2.example.com");
        servers.add("server3.example.com");
        
        // Create a consistent hash ring with 10 virtual nodes per server
        ConsistentHash<String> consistentHash = new ConsistentHash<>(10, servers);
        
        // Get server for some keys
        String key1 = "user123";
        String key2 = "photo456";
        String key3 = "video789";
        
        System.out.println("Key: " + key1 + " -> Server: " + consistentHash.getNode(key1));
        System.out.println("Key: " + key2 + " -> Server: " + consistentHash.getNode(key2));
        System.out.println("Key: " + key3 + " -> Server: " + consistentHash.getNode(key3));
        
        // Add a new server
        System.out.println("\nAdding a new server...");
        consistentHash.addNode("server4.example.com");
        
        // Check the same keys
        System.out.println("Key: " + key1 + " -> Server: " + consistentHash.getNode(key1));
        System.out.println("Key: " + key2 + " -> Server: " + consistentHash.getNode(key2));
        System.out.println("Key: " + key3 + " -> Server: " + consistentHash.getNode(key3));
    }
}
```

## Benefits of this Implementation

1. **Minimal Redistribution**: When a server is added or removed, only a fraction of the keys need to be remapped. This is because only the keys that hash to the range owned by the affected server need to be moved.

2. **Load Balancing**: By using virtual nodes, we get better distribution of keys across servers. Without virtual nodes, servers that happen to be close to each other on the ring would get very different amounts of data.

3. **Flexibility**: The implementation is generic (`ConsistentHash<T>`), so it can work with any type of node identifier.

## Performance Characteristics

- Adding/removing a node: O(K) where K is the number of virtual nodes per server
- Looking up a server for a key: O(log N) where N is the total number of virtual nodes
- Space complexity: O(N) where N is the total number of virtual nodes

## Common Use Cases

Consistent hashing is widely used in distributed systems, including:

1. **Distributed Caches**: Systems like Memcached and Redis use consistent hashing to distribute cache entries across multiple nodes.

2. **Content Delivery Networks (CDNs)**: To determine which edge server should serve content for a particular URL.

3. **Load Balancers**: To distribute requests across a pool of servers while maintaining session affinity.

## Understanding Key Redistribution

When a new server is added to the hash ring, one of the most important benefits of consistent hashing becomes apparent: minimal key redistribution. Let's understand exactly how this works and why it's so efficient.

### How Keys Get Redistributed

When a new server (let's call it ServerN) is added to the ring:

1. Only keys that hash to positions between ServerN and its predecessor need to be redistributed
2. These keys will only move to ServerN, not to any other servers
3. All other keys remain untouched and stay with their current servers

### Mathematical Analysis

Let's analyze why consistent hashing is so efficient:

1. **Theoretical Distribution**: 
   - With K servers, each server is responsible for approximately 1/K of the hash space
   - When adding the (K+1)th server, only 1/(K+1) of the total keys need to move
   - This means approximately 1/K * 1/(K+1) = 1/(K*(K+1)) of the keys from each existing server need to move

2. **Practical Example**:
   - With 3 servers: Adding a 4th server means ~25% of keys need to move
   - With 10 servers: Adding an 11th server means ~9% of keys need to move
   - With 100 servers: Adding a 101st server means ~1% of keys need to move

Here's a code snippet that demonstrates this redistribution:

```java
public class RedistributionAnalysis {
    public static void main(String[] args) {
        // Create initial set of servers
        List<String> servers = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            servers.add("server" + i + ".example.com");
        }
        
        ConsistentHash<String> consistentHash = new ConsistentHash<>(100, servers);
        
        // Generate some sample keys and track their initial distribution
        Map<String, String> keyToServerMap = new HashMap<>();
        for (int i = 1; i <= 1000; i++) {
            String key = "key" + i;
            keyToServerMap.put(key, consistentHash.getNode(key));
        }
        
        // Add a new server
        String newServer = "server4.example.com";
        consistentHash.addNode(newServer);
        
        // Count how many keys moved
        int movedKeys = 0;
        for (Map.Entry<String, String> entry : keyToServerMap.entrySet()) {
            String newServer = consistentHash.getNode(entry.getKey());
            if (!newServer.equals(entry.getValue())) {
                movedKeys++;
            }
        }
        
        System.out.printf("Total keys moved: %d (%.2f%%)\n", 
                         movedKeys, 
                         (movedKeys * 100.0) / keyToServerMap.size());
    }
}
```

### Impact of Virtual Nodes

Virtual nodes not only help with better distribution but also affect redistribution:

1. **More Predictable Movement**: With virtual nodes, the redistribution becomes more predictable and closer to the theoretical average
2. **Smoother Transitions**: The load is more evenly redistributed across the new server's virtual nodes
3. **Trade-off**: More virtual nodes mean more memory usage and slightly slower node addition/removal

For example, with 100 virtual nodes per server:
```java
// Example showing impact of virtual nodes on redistribution
ConsistentHash<String> hashWith100VNodes = new ConsistentHash<>(100, servers);  // More even distribution
ConsistentHash<String> hashWith1VNode = new ConsistentHash<>(1, servers);      // Less even distribution
```

### Best Practices for Minimizing Impact

1. **Gradual Addition**: Add servers gradually rather than all at once to spread out the redistribution load
2. **Monitor Load**: Keep track of the number of keys being redistributed to ensure it matches expectations
3. **Virtual Node Tuning**: Adjust the number of virtual nodes based on your specific needs:
   - More virtual nodes = better distribution but more memory usage
   - Fewer virtual nodes = less memory usage but potentially uneven distribution

## Conclusion

Consistent hashing is a powerful technique that solves the problem of redistributing data when the number of servers changes in a distributed system. The implementation we've looked at is production-ready and can be used as a starting point for building distributed systems that require efficient data partitioning.

Remember that while this implementation uses MD5 for hashing, you might want to use a different hash function depending on your specific requirements. The key is to ensure that your hash function provides a good distribution of values across the entire range of possible hash values.

Also, the number of virtual nodes is an important tuning parameter. More virtual nodes give better distribution but consume more memory and make node addition/removal operations slower. In practice, a value between 100 and 200 virtual nodes per server often provides a good balance.

