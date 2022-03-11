/*MIT License
Copyright 2022 ikasoba

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

End license text.
*/

/**
 * source: https://gist.github.com/ikasoba/2d90bbab319a8cd59c1f24582cc3671e
 * @desc 正規表現オブジェクトはそのまま埋め込まれ、それ以外はエスケープされます。
 * @return {RegExp} 組み立てた正規表現
 * @example
 * let binOps = /[+\-*\/]/
 * console.log(r`\\d${binOps}\\d``g`) // /\d(?:[+\-*\/])\d/g
 */
export default function r(reg,...exts){
  let r=[];
  return (flgs)=>new RegExp(reg.map((v,i)=>
    (i<reg.length-1)
      ? v+"(?:"+(
          exts[i] instanceof RegExp
          ? exts[i].source
          : exts[i].toString().replace(/[.*+?^=!:${}()|[\]/\\]/g,'\\$&')
        )+")"
      : v
  ).join(""),flgs)
}

export const integer = /[-+]?(?:[1-9][0-9]+|[0-9])/
export const number = /[-+]?(?:[1-9][0-9]+|[0-9])(?:\.[0-9]+)?/

r.integer = integer
r.number = number