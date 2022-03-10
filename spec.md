# YAML Like Markup Language 1.0
## syntax

### text
何にもマッチしなかった文字列はテキストノードへ変換します
```
<text> ::= [\s\S]+
```

### text block
子のインデントレベルはブロックの先頭のインデントレベルと同等かそれ以上でなければならない
```
<text block> ::= {<lb> <indent>.+ | <lb>}
```

### block
`<text block>`と同等に子のインデントレベルはブロックの先頭のインデントレベルと同等かそれ以上でなければならない
```
<block> ::= <indent><value> {<lb> <indent><value> | <lb>}
```

### whitespace
```
<whitespace> ::= [ \t]
```

### attrname
```
<attrname> ::= [^"'/=<>\r\n]+
```

### attrvalue
```
<attrvalue_d> ::= [^"\r\n]*
<attrvalue_s> ::= [^'\r\n]*
<attrvalue_n> ::= [^=<>"'`\s]+
```

### attr
```
<attr> ::= <attrname> = '"' <attrvalue_d> '"'
         | <attrname> = "'" <attrvalue_s> "'"
         | <attrname> = <attrvalue_n>
         | <attrname>
```

### attrs
```
<attrs> ::= <attr> { [\t ]* "," [\t ]* attr> }
```

### tagname
```
<tagname> ::= [a-zA-Z0-9\-]+
            | "[a-zA-Z0-9\-:]+"
            | '[a-zA-Z0-9\-:]+'
```

### doctype
```
<doctype> ::= ![Dd][Oo][Cc][Tt][Yy][Pp][Ee][ \t]+[Hh][Tt][Mm][Ll](?:[\t ]+([^\r\n<>]+))?[\t ]*:
```

### comment
コメントはHTMLのコメントへ変換するか消してもいい
```
<multiline comment> ::= "###" [\s\S]* "###"
<comment> ::= "#" .*
```

### string
- 改行をエスケープした場合、改行を削除する
- 改行以外をエスケープした場合、文字参照へ変換する
```
<string> ::= '"' ([^\\"]|\\.|\\<lb>)* '"'
```

### value
```
<value> ::= <tag>
          | <doctype>
          | <string>
          | <multiline comment>
          | <comment>
          | <text>
```

### indent
ブロックの先頭のインデントレベルと同等かそれ以上でなければならない
```
<indent> ::= " "+ | \t+
```

### linebreak
```
<lb> ::= \r\n|\r|\n
```

### text modes
```
<text modes> = [|>][-+]?
```

### tag
- 子の先頭に`<text modes>`が指定されたならば、
  - １文字目に`|`が指定されれば改行を`<br>`タグに変換する
  - １文字目に`>`が指定されれば改行を` `に変換する
  - ２文字目に`-`が指定されれば最後の改行を一つ消する
  - ２文字目に`+`が指定されなければブロックの終端にある複数の空行を無視する
```
<tag> ::= <tagname> ([\t ]+ <attrs>)? [\t ]* : [\t ]* ( <text modes> <lb> <text block>
  | <value>
  | <block> )
```

### body
何にもマッチしなかった文字列はすべてテキストノードに変換します
```
<body> ::= {<value> <lb> | <lb>}
```