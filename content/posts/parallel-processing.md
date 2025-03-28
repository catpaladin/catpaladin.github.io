+++
date = '2025-02-01T10:00:12-08:00'
draft = false
title = 'Go vs Python for Parallel Processing'
tags = ["go", "python", "concurrency", "parallelism"]
featured_image = "/images/go-connect.svg"
+++

I was inspired to write this article after a recent discussion about programming language preferences, specifically questioning my stance on Python. Let me start by acknowledging Python's strengths - it excels in machine learning and generative AI applications. However, I **prefer** Go for several compelling reasons:

- Memory management with pointers
- Elegant concurrency using channels and goroutines
- Straightforward cross-compilation of binaries
- Clean implementation of interfaces and structs

But preferences often face challenges. Some argue, "Python now has concurrency, so you should switch to Python." I fundamentally disagree with this reasoning. Developers should write code in languages they enjoy and find productive. In professional settings, use your preferred language until organizational standards dictate otherwise (i.e. Thou shalt use only thy golden hammer language of the team).

![python simps be like](/images/20250201-meme1.png "be like that huh")

This debate sparked my curiosity: how does Python 3.13's new GIL-disabled feature actually perform compared to Go's native concurrency? Let's run through an experiment and find out.

## Understanding the Basics: Concurrency vs. Parallelism

Before we compare Go and Python, let's clarify **two important terms**:

1. **Concurrency** – The ability to execute multiple tasks at the same time, but not necessarily in parallel. Tasks may start, run, and complete **independently** but share CPU resources.
2. **Parallelism** – The ability to execute multiple tasks **simultaneously** using multiple CPU cores.

Think of **concurrency** as multitasking (switching between tasks quickly) and **parallelism** as multiple workers doing different tasks at the same time. I find this important to talk about since I find engineers (or people who like to talk technical) using these interchangeably.

### **Concurrency Example (Go)**
Go allows multiple tasks (goroutines) to be **scheduled efficiently**, even if they're not running in parallel.

```go
go doTaskA()  // Runs independently
go doTaskB()  // Runs independently
```

### **Parallelism Example (Python)**
Python uses **multiple processes** to achieve parallelism, where each process runs on a different CPU core.

{{<admonition title="📝 NOTE" bg-color="#283593">}}
This is true of traditional Python. 3.13 lets you disable the setting that produces this behavior. I will explain that in the next section below.
{{</admonition>}}

```python
from multiprocessing import Pool

def task(x):
    return x * 2

with Pool(4) as p:  # 4 parallel workers
    results = p.map(task, range(10))
```

## The Fundamental Difference: GIL/Gill-Free vs Native Concurrency

Before I get into the Python analysis, I want to talk about the GIL. For those of you unfamiliar with Python, or those of you that only know enough of it to be dangerous, the GIL is the Global Interpreter Lock. You can read up more on it online, but two key features of it are:
- increased speed of single threaded programs
- easy integration with C libraries
### **Python: Evolution Beyond the GIL**
Starting with Python 3.13, there are two significant approaches to parallel execution:

1. **Traditional GIL-Based Threading**:
   - Historical limitation where only one thread can execute Python code at a time
   - Still the default behavior for backward compatibility
   - Suitable for I/O-bound tasks

2. **GIL-Free Execution (Python 3.13+)**:
   - Ability to disable GIL for true parallel execution
   - Requires explicit opt-in
   - Enables CPU-bound tasks to run in parallel

Let's perform a benchmark to show average time with GIL-Based Threading vs GIL-Free Execution. And then after that, I'll show you that Go still beats it.

{{<admonition title="📝 NOTE" bg-color="#283593">}}
Turning off the GIL requires that you either compile it with flags or download it. I just installed it using [pyenv](https://github.com/pyenv/pyenv) and appending `t` to the version.
{{</admonition>}}
```bash
# install 1.13.1 (GIL enabled by default)
pyenv install 1.13.1

# install 1.13.1 with GIL disabled
pyenv install 1.13.1t
```

Then you can verify in python with
```python
import sys
print(sys._is_gil_enabled())
# should return False
```

Anyways, here's how to leverage both approaches. First we need a script to test multiprocessing. We'll run it with the GIL enabled first. Then disabled second.

### `cpu_test.py`
```python
import sys
import time
import multiprocessing
from typing import List
from threading import Thread, Event, Lock


class CPUBenchmark:
    """
    Benchmark class for measuring CPU-bound task performance.
    """

    def __init__(self, num_threads: int):
        self.num_threads = num_threads
        self.completed = Event()
        self.lock = Lock()
        self.count = 0

    def cpu_task(self) -> None:
        """CPU-intensive calculation."""
        result = 0.0
        for i in range(50_000_000):
            result += (i * i) / (i + 1)

        with self.lock:
            self.count += 1
            if self.count == self.num_threads:
                self.completed.set()

    def run_threads(self) -> float:
        """
        Execute CPU task across multiple threads.
        Returns execution time in seconds.
        """
        start_time = time.perf_counter()
        threads: List[Thread] = []

        # Create and start threads
        for _ in range(self.num_threads):
            thread = Thread(target=self.cpu_task)
            thread.start()
            threads.append(thread)

        # Wait for completion
        for thread in threads:
            thread.join()

        return time.perf_counter() - start_time


def main() -> None:
    # Get system information
    cpu_count = multiprocessing.cpu_count()
    print(f"Python Version: {sys.version}")
    print(f"CPU Cores: {cpu_count}\n")

    # Run benchmark
    benchmark = CPUBenchmark(cpu_count)
    duration = benchmark.run_threads()

    # Report results
    print(f"Threads: {cpu_count}")
    print(f"Execution Time: {duration:.2f} seconds")
    print(f"Average Time per Thread: {duration/cpu_count:.2f} seconds")


if __name__ == "__main__":
    main()
```

Again, I use `pyenv` to switch between my python versions, but choose whatever method works best.

`GIL Enabled Example`
```bash
# set my local terminal to use 3.13.1 GIL enabled
pyenv local 3.13.1

python cpu_test.py
```

For me, this had an output of:
```
Python Version: 3.13.1
CPU Cores: 16

Threads: 16
Execution Time: 79.27 seconds
Average Time per Thread: 4.95 seconds
```

Next I tested with GIL disabled. This was pretty interesting since I never experimented with it when this first became available.

`GIL Disabled Example`
```bash
# set my local terminal to use 3.13.1 GIL disabled
pyenv local 3.13.1t

python cpu_test.py
```

The GIL-free had the output,
```
Python Version: 3.13.1 experimental free-threading build
CPU Cores: 16

Threads: 16
Execution Time: 16.19 seconds
Average Time per Thread: 1.01 seconds
```

That was cool and pretty fast. But realistically, when are you going to get a team at work to embrace something experimental because it's faster?

![reality](/images/20250201-meme2.png "reality")

### **Go: Goroutines and Channels**

Here are some basics on Go's native concurrency:
- Go uses **goroutines**, which are **lightweight** threads managed by the Go runtime.
- Goroutines **do not require OS threads** and have very low memory overhead (~2KB per goroutine).
- **Channels** are used to safely share data between goroutines (though I don't think I'll go into them in this blog).

Let's create a simple Go script. Setup the project and create a Go file.
```bash
go mod init cputest
```

### `main.go`
```go
package main

import (
	"fmt"
	"runtime"
	"sync"
	"time"
)

func cpuTask(wg *sync.WaitGroup, results chan<- float64) {
	defer wg.Done()

	var result float64
	// CPU-intensive calculation matching Python example
	for i := 0; i < 50_000_000; i++ {
		result += float64(i*i) / float64(i+1)
	}
	results <- result
}

func runBenchmark() time.Duration {
	// Get number of CPU cores
	numCPU := runtime.NumCPU()

	// Initialize sync primitives
	var wg sync.WaitGroup
	results := make(chan float64, numCPU)

	// Record start time
	start := time.Now()

	// Launch goroutines
	for i := 0; i < numCPU; i++ {
		wg.Add(1)
		go cpuTask(&wg, results)
	}

	// Wait for completion in separate goroutine
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect results
	for range results {
		// Process results if needed
	}

	return time.Since(start)
}

func main() {
	// Configure CPU usage
	numCPU := runtime.NumCPU()
	runtime.GOMAXPROCS(numCPU)

	// Print system info
	fmt.Printf("Go Version: %s\n", runtime.Version())
	fmt.Printf("CPU Cores: %d\n\n", numCPU)

	// Run benchmark
	duration := runBenchmark()

	// Report results
	fmt.Printf("Execution Time: %.2f seconds\n", duration.Seconds())
	fmt.Printf("Average Time per Goroutine: %.2f seconds\n",
		duration.Seconds()/float64(numCPU))
}
```

Next run `go run main.go` and you should see the output. My example:
```
Go Version: go1.23.4
CPU Cores: 16

Execution Time: 0.11 seconds
Average Time per Goroutine: 0.01 seconds
```

![lets GO](/images/20250201-meme3.png "lets GO")

## Comparisons

After diving deep into both Go and Python's parallel processing capabilities, I've got to say - Go's approach to concurrency is just beautiful in its simplicity. The numbers speak for themselves: 0.11 seconds versus Python's best effort of 16.19 seconds (even with the GIL disabled). That's not just a difference; that's a different league entirely.

While Python 3.13's GIL-free execution is impressive and shows the language's evolution, it still feels like retrofitting a solution onto an existing problem. Sure, a 5x performance improvement is nothing to sneeze at, but when Go's giving you nearly 150x better performance with a cleaner syntax and simpler mental model? That's hard to ignore.

Here's the thing - I appreciate what Python's trying to do here. The ability to disable the GIL is a significant step forward, and for existing Python codebases, it's a game-changer. But if I'm starting a new project that needs serious concurrent processing? Go's my first choice, no question. The combination of:

- Lightning-fast execution
- Dead-simple goroutine syntax
- Built-in concurrent design patterns
- Production-ready stability

Just makes it the obvious choice for building modern, concurrent systems. Python might be catching up, but Go was born ready for this stuff.

{{<admonition title="📝 NOTE" bg-color="#283593">}}
Go has brought interesting changes to Python before. Python's Protocol system was inspired by Go's interfaces.

I've implemented Protocols across several projects. Despite their theoretical benefits, team members often bypass the defined Protocol interfaces, favoring direct code duplication instead.
{{</admonition>}}

## The Verdict on Concurrency: Go vs Python 🎯

When it comes to concurrent programming, Go isn't just a good choice - it's demonstrably superior. While Python 3.13's GIL-free implementation shows promise, its use cases should be carefully considered.

### Appropriate Use Cases

The GIL-free Python implementation could benefit specific domains:

- Machine Learning workflows requiring parallel processing
- Data science pipelines with CPU-intensive operations
- Scientific computing applications
- A new and simple FastAPI that a Python dev team can maintain

### Misaligned Applications

However, using GIL-free Python for certain tasks, particularly those already optimized in Go, seems counter-intuitive. For example:

- Writing CLIs that wrap Go-based tools (Terraform, Helm, etc)
- Implementing network services requiring high concurrency
- Building system-level utilities

Why not just import the packages in Go, and just extend the usage to your use case?

### Future Potential

The most intriguing potential lies in Python's machine learning ecosystem. Given Python's dominance in ML, the performance improvements from GIL-free execution could significantly impact:

- Training optimization
- Model inference
- Parallel data processing pipelines

Thanks for diving into this performance comparison with me - now go experiment and build something concurrent, preferably in Go!
