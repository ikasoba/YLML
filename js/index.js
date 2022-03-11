#!/usr/bin/env node

/* eslint-env node */

import {globby} from "globby";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { YLMLLexer } from "./ylml.js";
import {Command} from "commander";
const program = new Command()
const bold = (s)=>s instanceof Array ? bold(s[0]) : `\u001b[1m${s}\u001b[0m`
const italic = (s)=>s instanceof Array ? italic(s[0]) : `\u001b[3m${s}\u001b[0m`

const commands = {
  "help":{
    desc:"Display this message",
    main(){
      process.stdout.write(Object.entries(commands).map(([k,{desc:v}])=>`- ${bold(italic(k))}
${v.split("\n").map(l=>"  "+l).join("\n")}`).join("\n\n")+"\n")
      }
    },
    "parse":{
      desc:`Parses file
You can use the glob pattern for paths
examples: \`${bold`ylml parse *.ylml`}\` \`${bold`ylml parse index.ylml`}\` \`${bold`ylml parse **/*.ylml`}\``,
  /**
   * @argument {Array<string>} argv
    */  }
  
}

const mkdir = async(path)=>{
  if (typeof path === "string")path=path.split("/").map((p,i,self)=>self.slice(0,i+1).join("/"))
  for (const p of path){
    try {
      const stat = await fs.stat(p)
      if (stat.isDirectory()){
        continue
      }else{
        console.error(`${p} is not Directory`)
      }
    }catch {
      fs.mkdir(p)
    }
  }
}

program
  .name("ylml")

program
  .command("parse")
  .description("parses file")
  .argument("<patterns...>","Files to parse, glob patterns can be used")
  .option("-o, --out <dir>","Directory to output files parsed into html","./")
  .action(async (patterns,{out:outDir})=>{
    function drawBar(c,max,l=10){
      return "[ "+(
        c>=1
          ? `parsed ${max} files`
          : Array.from({length:l},(_,c)=>c<=c/max*l ? "=" : " ").join("")
      )+" ]"
    }
    patterns=patterns.map(p=>p.replace(/\\/g,"/"))
    const paths = await globby(
      patterns,
      {
        onlyFiles:true
      }
    )
    if (!paths.length)return;
    const lexer = new YLMLLexer()
    let barCount = 0;
    process.stdout.write(`now parsing...
${drawBar(barCount,paths)}`)
    const evts = {
      addBar(){
        barCount++;
        process.stdout.write(`\u001b[1G${drawBar(barCount,paths.length)}`)
      }
    }
    paths.map(async(p)=>{
      const file = await fs.readFile(p,{encoding:"utf-8"})
      const lexed = lexer.lex(file)
      const br = file.match(/\r|\n|\r\n/)?.[0] || os.EOL
      const converted = lexed.map(x=>x.toHTML()).join(br)
      await mkdir(outDir)
      await fs.writeFile(path.resolve(outDir,path.basename(p,path.extname(p))+".html"),converted)
      evts.addBar()
    })
  })

program.parse(process.argv)