# YLML

## what's this
YLML is a markup language similar to YAML!

You can write it like this:
```
# These are all the same
element: child
"element": child
'element': child

# Nested structures are also possible.
element:
  element: hogehoge
  element:
    element: fugafuga

# If there is no more than one child, it can be written on a single line
element: element: element: hogehoge

# Attributes are written like this
element attr1="double quote", attr2='single quote', attr3=no_quote:

# The doctype is specified like this
!doctype html:
!DOCTYPE HTML:

# The doctype can contain any character
!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd":
```

## install
```
npm degit ikasoba/YLML
npm i -g ./
```

## usage
```
ylml parse *.ylml
```
```
$ ylml help
Usage: ylml [options] [command]

Options:
  -h, --help                     display help for command

Commands:
  parse [options] <patterns...>  parses file
  help [command]                 display help for command
```