import r from "./r.js"

export let HTMLIndent = "  "

// attribute
export const attrvalue_d = /[^"\r\n]*/
export const attrvalue_s = /[^'\r\n]*/
export const attrvalue_n = /[^=<>"'`\s,]+/
export const attrname = /[a-z-A-Z0-9_-]+/
export const attr = r`${attrname}=(?:"${attrvalue_d}"|'${attrvalue_s}'|${attrvalue_n})|${attrname}`()
export const attrs = r`${attr}(?:[\\t ]*,[\\t ]*${attr})*`()

// tag
export const tagname = /[a-zA-Z0-9-]+|"[a-zA-Z0-9\-:]+"|'[a-zA-Z0-9\-:]+'/
export const doctype_legacy = /[Ss][Yy][Ss][Tt][Ee][Mm][ \t]+(?:"about:legacy-compat"|'about:legacy-compat')/
export const doctype = 
  r`![Dd][Oo][Cc][Tt][Yy][Pp][Ee][ \\t]+[Hh][Tt][Mm][Ll](?:[\\t ]+${
    doctype_legacy
  })?[\\t ]*:`()
export const indent = r` +|\t+`()
export const tag = r`${tagname}(?:[\\t ]+${attrs})?[\\t ]*:`()
export const comment = r`#.*`()

export function $enum(...args){
  const mkobj = (s,l)=>(...keys)=>{
    let i=s
    return Object.fromEntries(keys.map((k)=>{
      const kv = [k,i]
      if (l>0)i+=l;
      else i=l(i)
      return kv
    }))
  }
  if ([args[0],args[1]].every(x=>typeof x === "number")){
    return mkobj(args[0],args[1])
  }else if (typeof args[0] === "number" && (typeof args[1] === "function")){
    return mkobj(args[0],args[1])
  }if (args.every(x=>typeof x == "string")){
    return mkobj(0,1)(...args)
  }else{
    return mkobj(args[0],1)
  }
}

export const emptyElements=[
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]

export class Element {
  constructor(tagname,children=[],attributes={}){
    this.tagname=tagname
    this.children=children
    this.attributes=attributes instanceof Attrs ? attributes : new Attrs(attributes)
  }
  htmlAttrs(){
    return this.attributes.toHTML()
  }
  htmlChildren(){
    return this.children.map(x=>x.toHTML().split("\n").map(l=>HTMLIndent+l).join("\n")).join("\n")
  }
  toHTML(){
    return `<${this.tagname}${this.attributes.isEmpty() ? " "+this.htmlAttrs() : ""}>${
      (!emptyElements.includes(this.tagname))
        ? `\n${this.htmlChildren()}\n</${this.tagname}>`
        : ""
    }`
  }
}

export class Comment {
  constructor(value){
    this.value=value
  }
  toHTML(){
    return `<!-- ${this.value} -->`
  }
}

export class MultilineComment extends Comment {
  toHTML(){
    return `<!--\n${this.value}\n-->`
  }
}

export class Doctype {
  constructor(legacy=false){
    this.legacy=legacy
  }
  toHTML(){
    return `<!DOCTYPE HTML${this.legacy ? ` SYSTEM "about:legacy-compat"` : ""}>`
  }
}

export class Text extends String {
  toHTML(){
    return `${this.valueOf()}`
  }
}

export class Attrs {
  constructor(attrs){
    this.attrs=attrs
  }
  isEmpty(){
    return Object.keys(this.attrs).length ? true : false
  }
  toHTML(){
    return Object.entries(this.attrs).map(([k,v])=>v ? `${k}=${v}` : `${k}`).join(" ")
  }
}

export class AttrName extends String {}

export class TagName extends String {}

export const LITERAL_MODE = {
  ...($enum(1,i=>i*2)(
    "DOUBLE",
    "SINGLE",
    "NOTHING",
  )),
  ...($enum(1,i=>i*2)(
    "ML_LB_BR",
    "ML_LB_SP",
    "ML_POP_LB",
    "ML_NO_IGNORE_LINES"
  )),
  ...($enum(2**15,i=>i*2)(
    "ALLOW_ESCAPE"
  )),
  get(c){
    return c=='"' ? 1 : c=="'" ? 2 : 4
  }
}

/**
 * @description "..." '...' ... などの形のリテラルを渡してください
 * @param {number} t LITERAL_MODE.NAME も使えます。
 * @param {number} mm LITERAL_MODE.ML_NAME も使えます
 */
export function parseLiteral(literal,t=0,mm=0){
  const allowEscape = !!(t&LITERAL_MODE.ALLOW_ESCAPE)
  const unmatch = t&1
    ? /\r|\n|\r\n|"/
    : t&2
      ? /\r|\n|\r\n|'/
      : t&4 && !allowEscape
        ? /[\r\n\t<>="'`]|\r\n/
        : null;
  let quote= t&1 ? '"' : t&2 ? "'" : ""
  if (allowEscape){
    let inLiteral = false
    for (let i=0;;i++){
      if (literal[i]=='"'){
        inLiteral=!inLiteral
      }
      if (i>=literal.length-1 && (inLiteral==false)){
        break
      }else if (i>=literal.length-1 && (inLiteral==true)){
        console.error(literal)
        throw new Error("error! literal is not closed!");
      }
      if (literal[i]=="\\"){
        i++;
        continue
      }
    }
    literal = literal[0] +
      literal.slice(1,-1)
      .replace(/\\u([a-fA-F0-9]{4})/g,`&#x$1;`)
      .replace(/\\x([a-fA-F0-9]{1,2})/g,`&#x$1;`)
      .replace(/\\(.)/g,(_,c)=>{
        return `&#x${c.charCodeAt(0).toString(16)};`
      })
      .replace(/\\(\r\n|\r|\n)/g,"")
      + literal.at(-1)
  }else if (mm>0){
    // +
    if ((mm&LITERAL_MODE.ML_NO_IGNORE_LINES)==0){
      literal=literal.replace(/(?:\r\n|\r|\n)+$/g,"")
    }else if (mm&LITERAL_MODE.ML_NO_IGNORE_LINES){
      literal+="\n"
      literal=literal.replace(/(?:\r\n|\r|\n)+$/g,m=>"<br>".repeat(m.length))
    }
    // |
    if (mm&LITERAL_MODE.ML_LB_BR){
      literal=literal.replace(/\r\n|\r|\n/g,"<br>")
    }
    // >
    if (mm&LITERAL_MODE.ML_LB_SP){
      literal=literal.replace(/\r\n|\r|\n/g," ")
    }
    if ((mm&LITERAL_MODE.ML_NO_IGNORE_LINES)==0 && ((mm&LITERAL_MODE.ML_POP_LB)==0)){
      literal+="<br>"
    }
  }
  if (t>0 && t<4 && ((literal[0]!=quote) || (literal.at(-1)!=quote))){
    throw new Error("error! invalid quote! "+literal)
  }
  if (t>0 && mm<=0 && (t&4 ? literal : literal.slice(1,-1)).match(unmatch)){
    throw new Error("error! invalid char!"+(t<4 ? literal.slice(1,-1) : literal).match(unmatch));
  }
  return literal
}

// attrsにマッチする文字列を渡してください
export function parseAttrs(raw,debug){
  const log = (...args)=>debug ? console.log(`[YLML.parseAttrs]:`,...args) : null
  const o = Object.create(null)
  for (let i=0;i<raw.length;){
    let m = raw.slice(i).match(r`^${attr}`())
    if (!m && (raw[i]==",") || (raw[i]==" ") || raw[i]=="\t"){
      i++;
      continue
    }else if (!m){
      throw new Error(`error! invalid char! i=${i}`);
    }
    const tmp = m[0].split(/^([^=]+)=/)
    if (tmp.length>1)tmp.splice(0,1)
    let [name,value] = tmp
    log(i,m[0],name,value,LITERAL_MODE.get(value?.[0]))
    if (value)value=parseLiteral(value,LITERAL_MODE.get(value[0]))
    o[name]=value||null
    i+=m[0].length
  }
  return o
}

export function parseDoctype(doctype){
  doctype.slice(0,-1).split(/[\t ]+/)
}

export class YLMLLexer {
  lex(src,debug=false){
    const log = (...args)=>debug ? console.log(`[YLML]:`,...args) : null
    const res=[]
    if (typeof src==="string")src=src.replace(/\r\n|\r|\n/g,"\n").split("\n")
    const lines = src
    log(lines)
    for (let l_i=0;l_i<lines.length;){
      let line = lines[l_i];
      let m;
      log(`line:`,line)
      //eslint-disable-next-line
      if (m=line.match(r`^###`())){
        const comment=[]
        l_i++
        for (let i=l_i;i<lines.length;i++){
          const line = lines[i]
          log(`find comments:`,m)
          if (line.startsWith("###")){
            l_i++
            break
          }else{
            comment.push(line)
            l_i++
          }
        }
        res.push(new MultilineComment(comment.join("\n")))
        continue
      //eslint-disable-next-line
      }else if (m=line.match(r`^${comment}`())){
        res.push(new Comment(m[0].slice(1)))
        l_i++
        continue
      }
      if (l_i==0 && (m=line.match(r`^${doctype}`()))){
        log(`match doctype:`,m)
        const dt = m[0].slice(0,-1).split(/[\t ]+/)
        res.push(new Doctype(dt.length==4))
        l_i++
        continue
      //eslint-disable-next-line
      }else if (m=line.match(r`^${tag}`())){
        log(`match tag:`,m)
        const element = m[0].slice(0,-1).split(/^([^ ]*) /)
        if (element.length>1)element.splice(0,1)
        if (element[0][0]=='"' || (element[0][0]=="'"))element[0]=element[0].slice(1,-1)
        log(`element:`,element,m[0].slice(0,-1))
        const child = []
        const block=[]
        let ln = line.slice(m[0].length).replace(/^[\t ]+/,"");
        l_i++
        const level = lines[l_i] ? lines[l_i].match(r`^${indent}`())?.[0] : null
        log("level:",level)
        if (!ln.match(/^[|>][-+]?[\t ]*$/) && level){
          for (let i=l_i;i<lines.length;i++){
            const line = lines[i]
            let m=line.match(r`^${indent}`()) || line=="" ? [line] : null;
            log(`find blocks:`,m)
            if (!m){
              break
            }else if (line=="" || m[0].startsWith(level)){
              block.push(line.slice(level.length))
              l_i++
            }else{
              break
            }
          }
          child.push(...this.lex(block,debug))
        }else{
          log(`one line child:`,m)
          // 文字列リテラルなら
          if (ln[0]=='"'){
            let lns = [ln];
            let inLiteral = false;
            log(`--- find end of literal ---`)
            for (let i=l_i;i<lines.length;i++){
              const line = lines[i]
              let indx=line.indexOf('"');
              if (line[indx-1]=="\\")indx=-1
              if (indx>=0){
                lns.push(line.slice(0,indx+1))
                l_i++
                inLiteral=!inLiteral
                if (inLiteral==true){break}
              }else{
                lns.push(line)
                l_i++
              }
            }
            log("lines:",lns)
            lns=lns.join("\n")
            ln=parseLiteral(lns,LITERAL_MODE.get(lns[0])|LITERAL_MODE.ALLOW_ESCAPE).slice(1,-1)
            child.push(new Text(ln))
          //eslint-disable-next-line
          }else if (m=ln.match(/^([|>])([-+])?[ \t]*$/)){
            let lns = [];
            const level = lines[l_i] ? lines[l_i].match(r`^${indent}`())?.[0] : null
            log(`--- find text children ---`)
            for (let i=l_i;i<lines.length;i++){
              const line = lines[i]
              let m=line.match(r`^${indent}`());
              if (line!="" && !m){
                break
              }else if (line=="" || m[0].startsWith(level)){
                lns.push(line.slice(level.length))
                l_i++
              }else{
                break
              }
            }
            log("lines:",lns)
            lns=lns.join("\n")
            let mode=0;
            log("mode:",m)
            if (m[1]=="|"){
              mode|=LITERAL_MODE.ML_LB_BR
            }else if (m[1]==">"){
              mode|=LITERAL_MODE.ML_LB_SP
            }
            if (m[2]=="-"){
              mode|=LITERAL_MODE.ML_POP_LB
            }else if (m[2]=="+"){
              mode|=LITERAL_MODE.ML_NO_IGNORE_LINES
            }
            ln=parseLiteral(lns,0,mode)
            child.push(new Text(ln))
          }else{
            child.push(...this.lex(ln,debug))
          }
        }
        res.push(new Element(element[0],child,element[1] ? parseAttrs(element[1],debug) : {}))
        continue
      }else if (line!=""){
        res.push(new Text(line))
        l_i++;
        continue
      }else {
        
        l_i++;
        continue
      }
    }
    log(`parse complete:`,res)
    return res
  }
}