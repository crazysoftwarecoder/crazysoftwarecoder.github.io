---
layout: post
title:  "Mono, Reactor, and Flux: The Reactively Ridiculous Trio!"
date:   2024-05-20 23:16:43 +1000
categories: spring mono reactor flux
---
Over the past year, I've been building parts of a BFF using [Project Reactor][project-reactor] along with spring boot. I found this a much better way to compose asynchronous calls while processing requests to various upstream services. As a BFF, one of the vectors that needs to maximised on is throughput. Blocking requests tend to exhaust their threads quickly as upstream services are being waited on. Hence the use of a non blocking framework such as reactor to the rescue.

This article talks about the different capabilities of using Reactor to process requests along with how to test those snippets.

**Hello Flux**

A simple way to create a Flux (a publisher that emits elements) is with the below:

{% highlight java %}
public class FluxGenerator<T> {
    public Flux<T> getSimpleFlux(T[] elements) {
        return Flux.just(elements);
    }
}
{% endhighlight %}

Generation and testing to see if the elements are emitted correctly can be done with StepVerifier

{% highlight java %}
@Test
public void testSimpleFlux() {
    FluxGenerator<Character> obj = new FluxGenerator<>();
    Flux<Character> flux = obj.getSimpleFlux(new Character[] {'a','b','c','d','e'});

    StepVerifier.create(flux)
            .expectNext('a')
            .expectNext('b')
            .expectNext('c')
            .expectNext('d')
            .expectNext('e')
            .verifyComplete();
}
{% endhighlight %}

{% highlight java %}
public class FluxGenerator<T> {
    public Flux<T> getSimpleFlux(T[] elements) {
        return Flux.just(elements);
    }
}
{% endhighlight %}

**Flux with transformations**

While processing requests there is generally the need to transform the emitted elements into different types or values. An example of this is transformation of upstream service or database value objects into response objects. This is generally achieved with a map operator.

{% highlight java %}
@Test
public void testMappedFlux() {
    FluxGenerator<Integer> obj = new FluxGenerator<>();
    Flux<Integer> flux = obj.getSimpleFlux(new Integer[] {1,2,3,4,5});
    flux = flux.map(element -> element + 1);

    StepVerifier.create(flux)
            .expectNext(2)
            .expectNext(3)
            .expectNext(4)
            .expectNext(5)
            .expectNext(6)
            .verifyComplete();
}
{% endhighlight %}

**Combining two Flux publishers**

As a natural extension of that, if you are working on a BFF layer or a top level service, you'd want to call many services in the backend and fetch results from each of them. Perhaps you have two services that return shards of data that you want to combine into one.

Merging the two is simple and can be done with the mergeWith operator. You can also reduce the verbosity of the StepVerifier by adding all the expectations in one `expectNext` call.

{% highlight java %}
@Test
public void testCombiningTwoFluxesIntoOne() {
    FluxGenerator<Integer> obj = new FluxGenerator<>();
    Flux<Integer> flux1 = obj.getSimpleFlux(new Integer[] {1,2,3,4,5});
    Flux<Integer> flux2 = obj.getSimpleFlux(new Integer[] {6,7,8,9,0});
    Flux<Integer> fluxCombined = flux1.mergeWith(flux2);
    StepVerifier.create(fluxCombined)
            .expectNext(1,2,3,4,5,6,7,8,9,0)
            .verifyComplete();
}
{% endhighlight %}

**Programmatic Flux**

Seeing those different fluxes generated statically with specific numbers as you saw in those previous examples, you might have a question as to how to dynamically generate values with a Flux, as in by calling a service and then using the response as part of the Flux generated elements. A Sink comes to the rescue. Let's let that sink in!

{% highlight java %}
@Test
public void testSubscriptionWithError() {
    Flux<String> flux = Flux.generate(
            () -> 'A',
            (state, sink) -> {
                sink.next(state + "");
                if (state == 'Z') sink.complete();
                return (char) (state + 1);
            }
    );
    flux.subscribe(elem -> System.out.print(elem + " "));
}

A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 
Process finished with exit code 0
{% endhighlight %}

This will print the entire alphabet in upper case. 

[project-reactor]: https://projectreactor.io