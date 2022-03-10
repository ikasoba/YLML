# YAML Like Markup Language 1.0
## text
何にもマッチしなかった文字列はテキストノードへ変換します
```
<text> ::= [\s\S]+
```

## text block
`<indent>`はブロックの先頭のインデントレベルと同等かそれ以上でなければならない
```
<text block> ::= {<lb> <indent>.+ | <lb>}
```

## whitespace
```
<whitespace> ::= [ \t]
```

## attrname
```
<attrname> ::= [^"'/=<>\r\n]+
```

## attrvalue
```
<attrvalue_d> ::= [^"\r\n]*
<attrvalue_s> ::= [^'\r\n]*
<attrvalue_n> ::= [^=<>"'`\s]+
```

## attr
```
<attr> ::= <attrname> = '"' <attrvalue_d> '"'
         | <attrname> = "'" <attrvalue_s> "'"
         | <attrname> = <attrvalue_n>
         | <attrname>
```

## attrs
```
<attrs> ::= <attr> { [\t ]* "," [\t ]* attr> }
```

## tagname
```
<tagname> ::= [a-zA-Z0-9\-]+
            | "[a-zA-Z0-9\-:]+"
            | '[a-zA-Z0-9\-:]+'
```

## doctype
```
<doctype legacy> ::= [Ss][Yy][Ss][Tt][Ee][Mm] [ \t]+ ('"about:legacy-compat"'|"'about:legacy-compat'")
<doctype> ::= ![Dd][Oo][Cc][Tt][Yy][Pp][Ee] [ \t]+ [Hh][Tt][Mm][Ll] <doctype legacy>? [\t ]* :
```

## comment
コメントはHTMLのコメントに変換します
```
<comment> ::= "#" .*
<multiple comment> ::= "###" [\s\S]* "###"
```

## string
- 改行をエスケープした場合、改行を削除する
- 改行以外をエスケープした場合、文字参照へ変換する
```
<string> ::= '"' ([^\\"]|\\.|\\<lb>)* '"'
```

## value
```
<value> ::= <tag>
          | <doctype>
          | <multiple comment>
          | <comment>
          | <string>
          | <text>
```

## indent
ブロックの先頭のインデントレベルと同等かそれ以上でなければならない
```
<indemt> ::= " "+ | \t+
```

## linebreak
```
<lb> ::= \r\n|\r|\n
```

## text modes
```
<text modes> = [|>][-+]?
```

## tag
`<indent>`はブロックの先頭のインデントレベルと同等かそれ以上でなければならない
```
<tag> ::= <tagname> ([\t ]+ <attrs>)? [\t ]* : [\t ]* ( <text modes> <text block>
  | <value>
  | { <lb><indent><value> | <lb> } )
```

## body
何にもマッチしなかった文字列はすべてテキストノードに変換します
```
<body> ::= {<value>}
```