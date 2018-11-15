## 오브젝트 구조 체크
- 오브젝트의 구조 확인 및 기본값을 위한 라이브러리
- function checkObject(target, scheme, removeUnmatched)
    - @param {object} target 확인할 오브젝트
    - @param {object} scheme 옵션 구조
        ``` 
        {
           [키1] : 정규식|문자열
           [키2] : [ 정규식|문자열, 기본값, 타입체크값 ]
           [키3] : {
               [RSymbol] : [ 키3에 대한 정규식|문자열 ]
               [키4] : [ 정규식|문자열, 기본값, 타입체크값 ]
       }
  
       기본값이 함수인 경우 반환 결과를 사용.
       타입체크값의 경우 문자열, 배열, 함수(func(value) => boolean) 가능.
       체크 가능한 타입 종류는 https://github.com/sindresorhus/is 확인
  
    - @param {boolean} removeUnmatched 구조에 맞지 않은 키를 남길지(false) 없앨지(true)
- symbol RecursiveSymbol
    - 재귀 체크를 위한 심볼
        ```
        const 
            checkObject = require('index.js'),
            RecursiveSymbol = checkObject.RecursiveSymbol;

        checkObject(
            { 
                recusives: {
                    inner: 'test' 
                } 
            }, 
            { 
                recusive: {
                    [RecursiveSymbol]: /recusive(s)?/, //없으면 'recusive'문자열 확인
                    inner: [ 'inner', 'default', 'string' ]
                }
            }
        )

        결과: { recusive: { inner: 'test' } }