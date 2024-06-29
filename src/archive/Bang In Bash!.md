---
title: Bang in Bash!
date: 2023-05-11
---

### The problem

If you write to a python file from the terminal, this error will throw:

```
$ echo "print('Hello world!')" > app.py
bash: !': event not found

```

### The explanation

Turns out that in Bash, 'bang' (the exclamation mark `(!)`) is a special character that references previous commands (history expansion).

> The bang (!) followed by the first character (or string) matching the command you want to run will repeat the most recent instance of that command _([source](https://www.redhat.com/sysadmin/bash-bang-command)):_

```
$ echo "Hello world!"
Hello world!

$ !e
echo "Hello world!"
Hello world!

```

The exclamation mark followed by the single quote `(')` gets interpreted as a command.

### The solution(s)

There are two:

1. Escape the special character so it's not interpreted by the terminal. <br>
   `$ echo "print('Hello world\!')" > app.py`

2. Enclose the entire string in single quotes, preventing Bash from intepreting any special characters inside the string. <br>
   `$ echo 'print("Hello world!")' > app.py`

```
$ echo 'print("Hello world!")' > app.py
$ py app.py
Hello world!
```

🎉
