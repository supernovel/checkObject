/**
 * FN  : checkObject.js
 * C   : 2018년 02월 12일 11시 56분 작성
 * DS  : 옵션으로 넘긴 구조를 기준으로 
 *       검색(구조는 키:정규식 으로 구성)후 
 *       최종적인 결과 리턴 하는 함수
 * N   :
 * A   : pej(ekfueh@naver.com)
 * L   : 
 */

const
    lodash = {
        get: require('lodash.get'),
        set: require('lodash.set'),
        cloneDeep: require('lodash.clonedeep')
    },
    is = require('@sindresorhus/is');

const RecursiveSymbol = Symbol('Regexp');

exports.RecursiveSymbol = RecursiveSymbol;
exports.RSymbol = RecursiveSymbol;

/**
 * checkObject
 * 
 * @param {object} target 확인할 오브젝트
 * @param {object} scheme 옵션 구조
 *      {
 *          [키1] : 정규식|문자열
 *          [키2] : [ 정규식|문자열, 기본값, 타입체크값 ]
 *          [키3] : {
 *              [RSymbol] : [ 키3에 대한 정규식|문자열 ]
 *              [키4] : [ 정규식|문자열, 기본값, 타입체크값 ]
 *      }
 * 
 *      기본값이 함수인 경우 반환 결과를 사용.
 *      타입체크값의 경우 문자열, 배열, 함수(func(value) => boolean) 가능.
 * 
 * @param {boolean} removeUnmatched 구조에 맞지 않은 키를 남길지 없앨지
 * 
 * @return {object} 결과 오브젝트
 */
module.exports = function checkObject(
    target, scheme, removeUnmatched
){
    const 
        output = {},
        targetType = is(target).toLowerCase();

    if(!is.object(target)) target = {};
    if(!is.object(scheme)) scheme = {};

    function recusiveFunc(object, scheme, prevSchemeKey){
        const 
            objectKeys = Object.keys(object),
            schemeKeys = Object.keys(scheme),
            remainKeys = objectKeys.slice(0);

        for(let idx=0; idx<schemeKeys.length; idx++){
            const 
                schemeKey = schemeKeys[idx],
                innerScheme = scheme[schemeKey],
                innerSchemeType = is(innerScheme).toLowerCase();

            if(schemeKey === RecursiveSymbol) continue;

            const saveKey = prevSchemeKey ? 
                [prevSchemeKey, schemeKey].join('.') 
                : schemeKey;

            //배열인 경우
            if(innerSchemeType == 'array'){
                const 
                    compValue = innerScheme[0],
                    typeName = innerScheme[2];
                
                let defaultValue = innerScheme[1],
                    checker = getChecker(compValue);

                if(checker == null) continue;

                for(let idx2=0; idx2<objectKeys.length; idx2++){
                    const objectKey = objectKeys[idx2];
                    let objectValue = object[objectKey];
                    
                    if(checker(objectKey)){
                        var index = remainKeys.indexOf(objectKey);
                        
                        if(index !== -1){
                            remainKeys.splice(index, 1);
                        }
                        
                        if(!typeChecker(typeName, objectValue)){
                            objectValue = undefined;
                        }
                        
                        output[saveKey] = objectValue;
                        break;
                    }
                }
                    
                if(is.function_(defaultValue)){
                    defaultValue = defaultValue();
                }

                if(output[saveKey] === undefined){
                    output[saveKey] = defaultValue;
                }
            //오브젝트인 경우
            }else if(innerSchemeType == 'object'){
                const compValue = innerScheme[RecursiveSymbol] || schemeKey;
                let nextObjectKey, nextObject,
                    checker = getChecker(compValue);

                if(checker == null) continue;
                
                for(let idx2=0; idx2<objectKeys.length; idx2++){
                    const 
                        objectKey = objectKeys[idx2],
                        objectValue = object[objectKey];
                    
                    if(checker(objectKey)){
                        nextObjectKey = objectKey;
                        nextObject = objectValue;
                        break;
                    }
                }

                if(nextObjectKey){
                    var index = remainKeys.indexOf(nextObjectKey);
                    
                    if(index !== -1){
                        remainKeys.splice(index, 1);
                    }
                }

                if(!is.object(nextObject)){
                    nextObject = {};
                }

                recusiveFunc(
                    nextObject, 
                    innerScheme,
                    saveKey
                );
            }else{
                let checker = getChecker(innerScheme);

                if(checker == null) continue;

                for(let idx2=0; idx2<objectKeys.length; idx2++){
                    const 
                        objectKey = objectKeys[idx2],
                        objectValue = object[objectKey];
                    
                    if(checker(objectKey)){
                        const index = remainKeys.indexOf(objectKey);
                        
                        if(index !== -1){
                            remainKeys.splice(index, 1);
                        }

                        output[saveKey] = objectValue;
                        break;
                    }
                }
            }

            if(output[saveKey] == undefined){
                delete output[saveKey];
            }
        }

        if(is.falsy(removeUnmatched)){
            for (var idx = 0; idx < remainKeys.length; idx++) {
                var objectKey = remainKeys[idx],
                    saveKey = prevSchemeKey ? [prevSchemeKey, objectKey].join('.') : objectKey;

                output[saveKey] = lodash.get(object, objectKey);
            }
        }
    }

    recusiveFunc(target, scheme);

    let result = {};

    if(targetType == 'array') result = [];
    
    for(let key in output){
        if(is.primitive(output[key]) || is.function_(output[key])){
            lodash.set(result, key, output[key]);
        }else lodash.set(result, key, lodash.cloneDeep(output[key]));
    }

    return result;
}

function getChecker(compValue){
    switch(is(compValue).toLowerCase()){
        case 'string':
            return (function(value){
                return (value == compValue);
            });
        case 'regexp':
            return compValue.test.bind(compValue);
    }
}

function typeChecker(type, value){
    switch(is(type).toLowerCase()){
        case 'string':
            return (is[type] && is[type](value));
        case 'function':
            return type(value);
        case 'array':
            return (type.findIndex((_type) => {
                return (is[_type] && is[_type](value));
            }) !== -1);
        default:
            return true;
    }
}