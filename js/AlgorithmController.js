var AlgorithmController = (function(){
    var generalConnector = ['|', '&', '<->', '->'];
    var initOptions = {
        false: ['false', '~true'],
        true: ['true', '~false']
    };
    var queryType = ['necessary', 'possibly', 'ever'];
    var listObjects = {
        agent: [],
        fluent: [],
        action: [],
        displayCalc: [],
        state: [],
        messages: [],
        res0Calc: [],
        newCalc: [],
        resCalc: [],
    };

    var statements = 
        {
            Sequence: [],
            Noninertial: [],
            Possible: [],
            Impossible: [],
            Constraint: []
        };

        var queryStatements = [
            {
                name: 'Executable',
                after: {
                    obj: 'Program',
                    join: [{
                        name: 'From',
                        after: 'State',
                        before: 'Program'
                    }]
                },
                before:null,
                both: false
            },
            {
                name: 'Accessible',
                after: {
                    obj: 'Formula',
                    join: [{
                        name: 'From',
                        after: 'State',
                        before: 'Formula'
                    }]
                },
                before:null,
                both: false
            },
            {
                name: 'After',
                after: {
                    obj: 'Program',
                    join: [{
                        name: 'From',
                        after: 'State',
                        before: 'Program'
                    }]
                },
                before:{
                    obj: 'Formula',
                    join: null
                },
                both: true
            },
            {
                name: 'Involved-In',
                after: {
                    obj: 'Program',
                    join: [{
                        name: 'From',
                        after: 'State',
                        before: 'Program'
                    }]
                },
                before:{
                    obj: 'Agent',
                    join: null
                },
                both: true
            }
        ];

    var languageStatements = [
        {
            name: 'Initially',
            after: {
                obj: 'Fluent',
                join: null
            },
            before: null,
            action: null,
            both: false
        },
        {
            name: 'Noninertial',
            after: {
                obj: 'Fluent',
                join: null
            },
            before: null,
            action: 'Noninertial',
            both: false
        },
        {
            name: 'Impossible',
            after: {
                obj: 'Action',
                join: [
                    {
                        name: 'By',
                        after: 'Agent',
                        before: 'Action'
                    },
                    {
                        name: 'If',
                        after: 'Fluent',
                        before: 'Agent'
                    }
                ]
            },
            before: null,
            action: 'Impossible',
            both: false
        },
        {
            name: 'Always',
            after: {
                obj: 'Fluent',
                join: null
            },
            before: null,
            action: 'Constraint',
            both: false
        },
        {
            name: 'After',
            after: {
                obj: 'Program',
                join: null
            },
            before: {
                obj: 'Fluent',
                join: null
            },
            action: 'Sequence',
            both: true
        },
        {
            name: 'Causes',
            after: {
                obj: 'Fluent',
                join: [
                    {
                        name: 'If',
                        after: 'Fluent',
                        before: 'Fluent'
                    }
                ],
                random: false
            },
            before: {
                obj: 'Action',
                join: [
                    {
                        name: 'By',
                        after: 'Agent',
                        before: 'Action'
                    }
                ]
            },
            action: 'Possible',
            both: true
        },
        {
            name: 'Releases',
            after: {
                obj: 'Fluent',
                join: [
                    {
                        name: 'If',
                        after: 'Fluent',
                        before: 'Fluent'
                    }
                ],
                random: true
            },
            before: {
                obj: 'Action',
                join: [
                    {
                        name: 'By',
                        after: 'Agent',
                        before: 'Action'
                    }
                ]
            },
            action: 'Possible',
            both: true
        }
    ];

    var setMessages = function(message){
        listObjects.messages.push(message);
    };

    var filterInit = function(elem, others, compare){
        var status = false;
        if(!isInArray(elem, generalConnector)){
            if(elem.includes('~')){
                if(isInArray(elem.substring(1), compare)){
                    status = true;
                }
            }
            else{
                if(isInArray(elem, compare)){
                    status = true;
                }                
            };
            if(!status){
                if(others.length){
                    var stat = false;
                    var pos = -1;
                    for(var i=0; i<others.length; i++){
                        if(typeof(others[i]) == 'object'){
                            others[i].forEach(function(el){
                                if(el.toUpperCase() == elem.toUpperCase()){
                                    stat = true;
                                }
                            });
                            if(stat){
                                break;
                            }
                        }
                        else{
                            if(others[i].includes('~')){
                                if(elem.includes('~')){
                                    if(others[i].substring(1).toUpperCase() == elem.substring(1).toUpperCase()){
                                        stat = true;
                                    }
                                }
                                else{
                                    if(others[i].substring(1).toUpperCase() == elem.toUpperCase()){
                                        stat = true;
                                    }
                                }
                            }
                            else{
                                if(elem.includes('~')){
                                    if(others[i].toUpperCase() == elem.substring(1).toUpperCase()){
                                        stat = true;
                                    }
                                }
                                else{
                                    if(others[i].toUpperCase() == elem.toUpperCase()){
                                        stat = true;
                                    }
                                }
                            }
                            if(stat){
                                if(others[i].toUpperCase() != elem.toUpperCase()){
                                    pos = i;
                                }
                                break;
                            }
                        }
                    };
                    if(stat){
                        if(pos != -1){
                            if(elem.includes('~')){
                                others[pos] = [elem.substring(1), elem];
                            }
                            else{
                                others[pos] = [elem, `~${elem}`];
                            }
                        }
                    }
                    else{
                        others.push(elem);   
                    }
                }
                else{
                    others.push(elem);
                }
            }
        };
        return others;
    };

    var plainedFormula = function(formula, result){
        formula.forEach(function(el){
            if(typeof(el) == 'object'){
                plainedFormula(el,result);
            }
            else{
                result.push(el);
            }
        });
        return result;
    }

    var genInitialState = function(init){
        var inits = [], others = [], initCompare = [];
        var formula = mergeFormula(statements.Constraint);
        if(init){
            init.split(' ').forEach(function(el){
                if(el != ""){
                    if(isInArray(el, initOptions.true)){
                        inits = [];
                        inits.push(...listObjects.fluent);
                    }
                    else if(isInArray(el, initOptions.false)){
                        inits = [];
                        listObjects.fluent.forEach(function(e){
                            inits.push(`~${e}`);
                        });
                    }
                    else{
                        if(!isInArray(el, ['Initially']) && !isInArray(el, generalConnector)){
                            var status = false;
                            var pos = 0;
                            inits.forEach(function(e, idx){
                                if(e.includes('~')){
                                    if(el.includes('~')){
                                        if(el.substring(1).toUpperCase() == e.substring(1).toUpperCase()){
                                            status = true;
                                            pos = idx;
                                        }
                                    }
                                    else{
                                        if(el.toUpperCase() == e.substring(1).toUpperCase()){
                                            status = true;
                                            pos = idx;
                                        }
                                    }
                                }
                                else{
                                    if(el.includes('~')){
                                        if(el.substring(1).toUpperCase() == e.toUpperCase()){
                                            status = true;
                                            pos = idx;
                                        }
                                    }
                                    else{
                                        if(el.toUpperCase() == e.toUpperCase()){
                                            status = true;
                                            pos = idx;
                                        }
                                    }
                                }
                            });
                            if(status){
                                inits[pos] = el;
                            }
                            else{
                                inits.push(el);
                            }
                        }
                    }   
                }
            });
        }
        inits.forEach(function(el){
            if(el.includes('~')){
                initCompare.push(el.substring(1));
            }
            else{
                initCompare.push(el);
            }
        });
        if(inits.length == listObjects.fluent.length){
            return filterState([inits], formula);
        }
        else{
            statements.Constraint.forEach(function(el){
                plainedFormula(el.formula, []).forEach(function(e){
                    others = filterInit(e, others, initCompare);
                });
            });
            statements.Impossible.forEach(function(el){
                plainedFormula(el.formula, []).forEach(function(e){
                    others = filterInit(e, others, initCompare);
                });
            });
            statements.Possible.forEach(function(el){
                plainedFormula(el.formula_effect, []).forEach(function(e){
                    others = filterInit(e, others, initCompare);
                });
                plainedFormula(el.formula_precondition, []).forEach(function(e){
                    others = filterInit(e, others, initCompare);
                });
            });
            statements.Sequence.forEach(function(el){
                plainedFormula(el.formula, []).forEach(function(e){
                    others = filterInit(e, others, initCompare);
                });
            });
            var initials = [...inits, ...others];
            return filterState(getModel(initials), formula);
        }
    };

    var getModel = function(obj){
        var valInitials = [];
        for(var i=0; i<obj.length; i++){
            if(i==0){
                if(typeof(obj[i]) == 'object'){
                    valInitials.push(obj[i].length);
                }
                else{
                    valInitials.push(1);
                }
            }
            else{
                if(typeof(obj[i]) == 'object'){
                    valInitials.push(obj[i].length*valInitials[i-1]);
                }
                else{
                    valInitials.push(1*valInitials[i-1]);
                }
            }
        };
        var models = [];
        var total = 1;
        valInitials.forEach(function(el){
            total = total*el;
        });
        if(total == 1){
            models.push(obj);
        }
        else{
            while(total != 1){
                var tmp = [];
                for(var i=0; i<obj.length; i++){
                    if(typeof(obj[i]) == 'object'){
                        tmp.push(obj[i][valInitials[i] % obj[i].length]);
                    }
                    else{
                        tmp.push(obj[i]);
                    }
                    if(i == obj.length-1){
                        if(valInitials[i] > 1){
                            valInitials[i]--;
                        }
                    }
                    else{
                        var count = 0;
                        for(var j=i; j<obj.length-1; j++){
                            if(valInitials[j+1] % obj[j+1].length == 1){
                                count++;
                            }
                        };
                        if(count == (obj.length-i)-1){
                            if(valInitials[i] > 1){
                                valInitials[i]--;
                            }
                        }
                    }
                };
                models.push(tmp);
                total = 1;
                valInitials.forEach(function(el){
                    total = total*el;
                });
                if(total == 1){
                    var tmp = [];
                    for(var i=0; i<obj.length; i++){
                        if(typeof(obj[i]) == 'object'){
                            tmp.push(obj[i][valInitials[i] % obj[i].length]);
                        }
                        else{
                            tmp.push(obj[i]);
                        }
                    };
                    models.push(tmp);
                }
            }
        }
        return models;
    };

    var possibleStates = function(obj){
        var state = [];
        obj.forEach(function(el, idx){
            state.push([]);
            for(var j=0; j<Math.pow(2, idx+1); j++){
                if(j%2 == 0){
                    for(var k=0; k<(Math.pow(2, obj.length) / Math.pow(2, idx+1)); k++){
                        state[idx].push(`~${el}`);
                    }
                }
                else{
                    for(var k=0; k<(Math.pow(2, obj.length) / Math.pow(2, idx+1)); k++){
                        state[idx].push(el);
                    }
                }
            }
        });
        state = transpose(state);
        return state;
    };

    var mergeFormula = function(formulas){
        var completeFormula = [];
        for(var i=0; i<formulas.length; i++){
            if(i != formulas.length-1){
                completeFormula.push(formulas[i].formula);
                completeFormula.push("&");
            }
            else{
                completeFormula.push(formulas[i].formula);
            }
        }
        return completeFormula;
    }

    var filterState = function(states, formula){
        states = states.filter(function(el){
            if(processFormula(formula, el)){
                return el;
            }
        });
        return states;
    }

    var generateStates = function(obj, init){
        init.forEach(function(elem, model){
            var tmpState = [];
            var formula = mergeFormula(statements.Constraint);
            var state = filterState(possibleStates(obj), formula);
            replace = 0;
            copyInit = [...elem];
            for(var i=0; i<state[0].length; i++){
                var pos = -1;
                for(var j=0; j<elem.length; j++){
                    if(state[0][i].includes('~')){
                        if(elem[j].includes('~')){
                            if(state[0][i].substr(1) == elem[j].substr(1)){
                                pos=j;
                                break;
                            }
                        }
                        else{
                            if(state[0][i].substr(1) == elem[j]){
                                pos=j;
                                break;
                            }
                        }
                    }
                    else{
                        if(elem[j].includes('~')){
                            if(state[0][i] == elem[j].substr(1)){
                                pos=j;
                                break;
                            }
                        }
                        else{
                            if(state[0][i] == elem[j]){
                                pos=j;
                                break;
                            }
                        }
    
                    }
                }   
                copyInit[i] = elem[pos];
            }
            state.forEach((el,idx) => {
                if(JSON.stringify(el)==JSON.stringify(copyInit)){
                    replace=idx;
                }
            });
            state[replace]=state[0];
            state[0]=copyInit;
            state.forEach(function(el, idx){
                var tmpObj = createObj(['name', 'value'], [`σ${idx}`, el]);
                tmpState.push(tmpObj);
            });
            listObjects.state.push(createObj(['model', 'value'], [model+1, tmpState]));
        });
    }

    var breakDown = function(obj){
        if(typeof(obj) == 'object'){
            var tmp='';
            if(obj == null){
                tmp = '∅';
            }
            else{
                obj.forEach(function(el, idx){
                    if(idx<obj.length-1){
                        tmp+=`${el}, `;
                    }
                    else{
                        tmp+=`${el}`;
                    }
                });
            }
        }
        else{
            tmp = obj;
        }
        return tmp;
    }

    var inBracket = function(obj, typeObj='normal'){
        var tmp;
        if(typeObj.toLowerCase()=='curly'){
            tmp = `{${breakDown(obj)}}`;
        }
        else if(typeObj.toLowerCase()=='square'){
            tmp = `[${breakDown(obj)}]`;
        }
        else{
            tmp = `(${breakDown(obj)})`;
        }
        return tmp;
    }

    var setListCalculations = function(obj, typeObj='normal', state=null, newCalc = false){
        var result = [];
        if(!state){
            obj.forEach(function(el){
                result.push(`${el.name} = ${inBracket(el.value, typeObj)}`);
            });
        }
        else{
            result.push(' - ');
            obj.forEach(function(el){
                if(el.agent){
                    if(newCalc){
                        if(el.compare){
                            el.compare.forEach(function(e){
                                result.push(`${state}(${el.action}, ${el.state}, ${e.state}, ${el.agent}) = ${inBracket(e.result, typeObj)}`);
                            });
                        }
                    }
                    else{
                        if(el.result){
                            result.push(`${state}(${el.action}, ${el.state}, ${el.agent}) = ${inBracket(el.result, typeObj)}`);
                        }
                        else{
                            result.push(`${state}(${el.action}, ${el.state}, ${el.agent}) = ${breakDown(el.result)}`);
                        }
                    }
                }
                else{
                    if(newCalc){
                        if(el.compare){
                            el.compare.forEach(function(e){
                                result.push(`${state}(${el.action}, ${el.state}, ${e.state}) = ${inBracket(e.result, typeObj)}`);
                            });
                        }
                    }
                    else{
                        
                        if(el.result){
                            result.push(`${state}(${el.action}, ${el.state}) = ${inBracket(el.result, typeObj)}`);
                        }
                        else{
                            result.push(`${state}(${el.action}, ${el.state}) = ${breakDown(el.result)}`);
                        }
                    }
                }
            });
        }
        return result;
    }

    var transpose = function(obj){
        var tmp=[];
        for(var i=0;i<obj.length; i++){
            for(var j=0;j<obj[i].length; j++){
                if(i==0){
                    tmp.push([]);
                    for(var k=0;k<obj.length; k++){
                        tmp[j].push(obj[k][j]);
                    }
                }
            }
        }
        return(tmp);
    };

    var isInArray = function(el, obj, init=false){
        var status = false;
        for(var i=0; i<obj.length; i++){
            if(init){
                if(obj[i].includes('~')){
                    if(obj[i].substring(1).toUpperCase() == el.toUpperCase()){
                        status=true;
                        break;
                    }
                }
                else{
                    if(obj[i].toUpperCase() == el.toUpperCase()){
                        status=true;
                        break;
                    }
                }
            }
            else{
                if(obj[i].toUpperCase() == el.toUpperCase()){
                    status=true;
                    break;
                }
            }
        }
        return status;
    }

    var addObj = function(statement, obj){
        if(!isInArray(statement, listObjects[obj])){
            listObjects[obj].push(statement);
        };
    };


    var clearSpace = function(obj){
        obj = obj.replace(/[\s]/gi, '');
        return obj;
    };

    var countScope = function(data){
        var openScope = 0, closeScope = 0;
        for(var i=0; i<data.length; i++){
            if(data[i]=="("){
                openScope++;
            }
            else if(data[i]==")"){
                closeScope++;
            }
        };
        return {
            open : openScope,
            close : closeScope
        }
    };

    var getPrograms = function(scope){
        try{
            var copyScope = scope.join(' ');
            var status=null;
            var count = countScope(copyScope);
            if((count.open != count.close) || (count.open == 0 && count.close == 0)){
                return {
                    value: [],
                    status: false
                };
            }
            else{
                var slicedScope = copyScope.substring(copyScope.indexOf('(')+1, copyScope.lastIndexOf(')'));
                var tmpScope = [];
                slicedScope.split(',').forEach(function(el){
                    if(el.toUpperCase().includes('BY')){
                        el = el.split(' ').map(function(e){
                            if(clearSpace(e).toUpperCase().includes('BY')){
                                return ',';
                            }
                            else{
                                return e;
                            };
                        });
                        tmpScope.push(`(${el.join(' ')})`);
                    }
                    else{
                        tmpScope.push(el);
                    }
                });
                slicedScope = tmpScope.join(',');
                var count = countScope(slicedScope);
                if(count.open == 0 && count.close == 0){
                    slicedScope = slicedScope.split(',');
                    slicedScope = slicedScope.filter(function(el){
                        if(el != ''){
                            return el; 
                        }
                    });
                    slicedScope = slicedScope.map(function(el){
                        return [clearSpace(el)];
                    });
                    return {
                        value: slicedScope,
                        status: true
                    };
                }
                else{
                    slicedScope = clearSpace(slicedScope);
                    var newScope = '';
                    for(var i=0; i<slicedScope.length; i++){
                        if(slicedScope[i] == '('){
                            newScope += `${slicedScope[i]}"`;
                        }
                        else if(slicedScope[i] == ')'){
                            newScope += `"${slicedScope[i]}`;
                        }
                        else if(slicedScope[i] == ','){
                            if(slicedScope[i-1] != ')' && slicedScope[i+1] != '('){
                                newScope += `"${slicedScope[i]}"`;
                            }
                            else{
                                newScope += slicedScope[i];
                            }
                        }
                        else{
                            newScope += slicedScope[i];
                        }
                    }
                    newScope = newScope.replace(/[(]/gi, '[');
                    newScope = newScope.replace(/[)]/gi, ']');
                    newScope = `[${newScope}]`;
                    newScope = JSON.parse(newScope);
                    newScope = newScope.filter(function(el){
                        if(el != ''){
                            return el;
                        }
                    });
                };
                status=true;
                newScope.forEach(function(el){
                    if(el.length > 2){
                        status = false;
                    };
                });
                return {
                    value: newScope,
                    status: status
                };
            }
        }
        catch{
            return {
                value: [],
                status: false
            };
        }
    };

    var passObj = function(obj, status){
        if(status){
            el = obj.replace(/[()]/gi, '');
            if(el.includes('~')){
                addObj(el.substring(1), status.toLowerCase());
            }
            else{
                addObj(el, status.toLowerCase());
            }
        }
    };
    
    var createObj = function(el, val){
        var obj = new Object();
        el.forEach(function(e,idx){
            obj[e]=val[idx];
        });
        return obj;
    };

    var getJoinPosition = function(obj, join){
        var positions = [];
        join.forEach(function(el){
            for(var i=0; i<obj.length; i++){
                if(el.name.toUpperCase()==obj[i].toUpperCase()){
                    positions.push(createObj(['statement', 'pos'], [el.name.toUpperCase(), i]));
                }
            }
        });
        return positions;
    };

    var filterObj = function(el, i, pos, index = 0, join=false, posjoin=null){
        if(languageStatements[i][pos].obj == 'Program'){
            if(el.length == 1){
                passObj(el[0], 'Action');
            }
            else{
                passObj(el[0], 'Action');
                passObj(el[1], 'Agent');
            }
        }
        else{
            if(!isInArray(el, generalConnector) && !isInArray(el, initOptions.true) && !isInArray(el, initOptions.false)){
                if(join){
                    passObj(el, languageStatements[i][pos].join[index][posjoin]);
                }
                else{
                    passObj(el, languageStatements[i][pos].obj);
                }
            }
        }
    };

    var copyArray = function(arr, lbound, hbound = arr.length){
        var newArr = [];
        for(var i=lbound; i<hbound; i++){
            newArr.push(arr[i]);
        }
        return newArr;
    };

    var filterJoin = function(obj, listPositions, i, pos, status, posJoin){
        languageStatements[pos][status].join.forEach(function(el, idx){
            if(el.name.toUpperCase() == listPositions[i].statement.toUpperCase()){
                obj.forEach(function(e){
                    filterObj(e, pos, status, idx, true, posJoin);
                });
            }
        });
    }

    var dataJoin = function(obj, listPositions){
        var befores= [], afters = [];
        for(var i=0; i<listPositions.length; i++){
            var subBefore = null, subAfter = null;
            if(listPositions.length==1){
                subBefore=copyArray(obj, 0, listPositions[i].pos);
                subAfter=copyArray(obj, listPositions[i].pos+1);
            }
            else{
                if(i==0){
                    subBefore=copyArray(obj, 0, listPositions[i].pos);
                    subAfter=copyArray(obj, listPositions[i].pos+1, listPositions[i+1].pos);
                }
                else if(i==listPositions.length-1){
                    subBefore=copyArray(obj, listPositions[i-1].pos+1, listPositions[i].pos);
                    subAfter=copyArray(obj, listPositions[i].pos+1);
                }
                else{
                    subBefore=copyArray(obj, listPositions[i-1].pos+1, listPositions[i].pos);
                    subAfter=copyArray(obj, listPositions[i].pos+1, listPositions[i+1].pos); 
                }
            }
            if(subBefore){befores.push(subBefore)}
            if(subAfter){afters.push(subAfter)}
        };
        return {
            before: befores,
            after: afters
        }
    };

    var logicAnd = function(left, right, data){
        if(left != true && left != false){
            left = isInArray(left, data);
        }
        if(right != true && right != false){
            right = isInArray(right, data);
        }
        return left && right;
    }

    var logicOr = function(left, right, data){
        if(left != true && left != false){
            left = isInArray(left, data);
        }
        if(right != true && right != false){
            right = isInArray(right, data);
        }
        return left || right;
    }

    var logicImplication = function(left, right, data){
        if(left != true && left != false){
            left = isInArray(left, data);
        }
        if(right != true && right != false){
            right = isInArray(right, data);
        }
        if(left && !right){
            return false;
        }
        else{
            return true;
        }
    }

    var logicEquivalence = function(left, right, data){
        if(left != true && left != false){
            left = isInArray(left, data);
        }
        if(right != true && right != false){
            right = isInArray(right, data);
        }
        return left === right;
    }

    var processFormula = function(formula, state){
        if(formula.length){
            var copyFormula = [...formula];
            for(var i=0; i<copyFormula.length; i++){
                if(typeof(copyFormula[i]) == 'object'){
                    copyFormula[i] = processFormula(copyFormula[i], state);
                }
            }
            if(copyFormula.length>1){
                for(var i=0; i<copyFormula.length; i++){
                    if(copyFormula[i]=="&"){
                        copyFormula[i+1] = logicAnd(copyFormula[i-1], copyFormula[i+1], state);
                    }
                    else if(copyFormula[i]=="|"){
                        copyFormula[i+1] = logicOr(copyFormula[i-1], copyFormula[i+1], state);
                    }
                    else if(copyFormula[i]=="->"){
                        copyFormula[i+1] = logicImplication(copyFormula[i-1], copyFormula[i+1], state);
                    }
                    else if(copyFormula[i]=="<->"){
                        copyFormula[i+1] = logicEquivalence(copyFormula[i-1], copyFormula[i+1], state);
                    }
                };
                return copyFormula[copyFormula.length-1];
            }
            else{
                result = null;
                copyFormula.forEach(function(el){
                    if(el != true && el != false){
                        result = isInArray(el, state);
                    }
                    else{
                        result = el;
                    }
                });
                return result;
            }
        }
        else{
            return true;
        }
    }

    var countLogic = function(fluent, connector, data){
        for(var i=0; i<data.length; i++){
            if(typeof(data[i]) == 'object'){
                count = countLogic(fluent, connector, data[i]);
                fluent = count.fluent;
                connector= count.connector;
            }
            else{
                if(!isInArray(data[i], generalConnector)){
                    fluent++;
                }
                else{
                    connector++;
                }
            }
        };
        return {
            fluent: fluent,
            connector: connector
        };
    };

    var getFormula = function(scope){
        try{
            var copyScope = scope.join(' ');
            var openScope = 0, closeScope = 0;
            for(var i=0; i<copyScope.length; i++){
                if(copyScope[i]=="("){
                    openScope++;
                }
                else if(copyScope[i]==")"){
                    closeScope++;
                }
            };
            if(openScope != closeScope){
                return {
                    value: [],
                    status: false
                };
            }
            else{
                scope = scope.map(function(el, idx){    
                    el = el.replace(/[(]/gi, '[');
                    el = el.replace(/[)]/gi, ']');
                    if(idx == scope.length-1){
                        if(el.includes('[')){
                            return `${el.substring(0, el.lastIndexOf("[")+1)}"${el.substring(el.lastIndexOf("[")+1)}"`
                        }
                        else if(el.includes(']')){
                            return `"${el.substring(0, el.indexOf("]"))}"${el.substring(el.indexOf("]"))}`
                        }
                        else{
                            return `"${el}"`
                        }
                    }
                    else{
                        if(el.includes('[')){
                            return `${el.substring(0, el.lastIndexOf("[")+1)}"${el.substring(el.lastIndexOf("[")+1)}",`
                        }
                        else if(el.includes(']')){
                            return `"${el.substring(0, el.indexOf("]"))}"${el.substring(el.indexOf("]"))},`
                        }
                        else{
                            return `"${el}",`
                        }
                    }
                });
                scope = scope.join(' ');
                scope = `[${scope}]`;
                scope = JSON.parse(scope);
                scope = scope.filter(function(el){
                    if(el != ''){
                        return el; 
                    }
                });
                count = countLogic(0,0,scope);
                var countFluent = count.fluent, countConnector = count.connector;
                var status=true;
                if(countFluent || countConnector){
                    if(countFluent-countConnector!=1){
                        status=false;
                    }
                }
                return {
                    value: scope,
                    status: status
                };
            }
        }
        catch{
            return {
                value: [],
                status: false
            };
        }
    };

    var calculateSequence = function(compare){
        var result = [];
        statements.Sequence.forEach(function(el){
            if(compare.length == el.programs.length){
                for(var i=0; i<el.programs.length; i++){
                    var status = false;
                    if(!el.programs[i][1]){
                        agent = 0;
                    }
                    else{
                        agent = el.programs[i][1].toUpperCase();
                    }
                    if(compare.length == 1){
                        compareAgent = 0;
                    }
                    else{
                        if(!compare[i][1]){
                            compareAgent = 0;
                        }
                        else{
                            compareAgent = compare[i][1].toUpperCase();
                        }
                    }
                    if(compare[i][0].toUpperCase()==el.programs[i][0].toUpperCase() && compareAgent==agent){
                        status = true;
                    }
                }
                if(!status){
                    result.push(el.formula);
                }
            }
        });
        return result;
    };

    var calculateImpossible = function(action, agent, state){
        var status = false;
        if(agent){
            for(var i=0; i<statements.Impossible.length; i++){
                if(statements.Impossible[i].agent){
                    if(action.toUpperCase() == statements.Impossible[i].action.toUpperCase() && agent.toUpperCase() == statements.Impossible[i].agent.toUpperCase()){
                        if(processFormula(statements.Impossible[i].formula, state)){
                            status = true;
                            break;
                        }
                    }
                }
                else{
                    if(action.toUpperCase() == statements.Impossible[i].action.toUpperCase()){
                        if(processFormula(statements.Impossible[i].formula, state)){
                            status = true;
                            break;
                        }
                    }
                }
            }
        }
        else{
            for(var i=0; i<statements.Impossible.length; i++){
                if(action.toUpperCase() == statements.Impossible[i].action.toUpperCase()){
                    if(processFormula(statements.Impossible[i].formula, state)){
                        status = true;
                        break;
                    }
                }
            }
        }
        return status;
    };

    var calculatePossible = function(action, agent, state){
        var result = [];
        if(agent){
            for(var i=0; i<statements.Possible.length; i++){
                if(statements.Possible[i].agent){
                    if(action.toUpperCase() == statements.Possible[i].action.toUpperCase() && agent.toUpperCase() == statements.Possible[i].agent.toUpperCase()){
                        if(processFormula(statements.Possible[i].formula_precondition, state.value)){
                            result.push(statements.Possible[i].formula_effect);
                        }
                        else{
                            result.push(null);
                        }
                    }
                }
                else{
                    if(action.toUpperCase() == statements.Possible[i].action.toUpperCase()){
                        if(processFormula(statements.Possible[i].formula_precondition, state.value)){
                            result.push(statements.Possible[i].formula_effect);
                        }
                        else{
                            result.push(null);
                        }
                    }
                }
            }
        }
        else{
            for(var i=0; i<statements.Possible.length; i++){
                if(action.toUpperCase() == statements.Possible[i].action.toUpperCase()){
                    if(processFormula(statements.Possible[i].formula_precondition, state.value)){
                        result.push(statements.Possible[i].formula_effect);
                    }
                    else{
                        result.push(null);
                    }
                }
            }
        }
        return result;
    };

    var compareState = function(state1, state2, action, agent){
        result = [];
        for(var i=0; i<state1.length; i++){
            var status = false;
            if(statements.Noninertial.length){
                statements.Noninertial.forEach(function(el){
                    if(state1[i].includes('~')){
                        if(state1[i].substring(1).toUpperCase() == el.toUpperCase()){
                            status = true;
                        }
                    }
                    else{
                        if(state1[i].toUpperCase() == el.toUpperCase()){
                            status = true;
                        }
                    }
                });
            }
            if(!status){
                if(state1[i] != state2[i]){
                    result.push(state2[i]);
                }
                else{
                    statements.Possible.forEach(function(el){
                        if(el.random){
                            if(el.action.toUpperCase() == action.toUpperCase() && el.agent.toUpperCase() == agent.toUpperCase()){
                                var status = false;
                                el.formula_effect.forEach(function(e){
                                    if(e.toUpperCase() == state1[i].toUpperCase()){
                                        status = true;
                                    }
                                })
                                if(status){
                                    result.push(state1[i]);
                                }
                            }
                        }
                    });
                }
            }
        }
        return result;
    };

    var getMinRes = function(data){
        var min = null;
        var result = [];
        data.forEach(function(el, idx){
            if(idx==0){
                min = el.result.length;
            }
            else{
                if(min>el.result.length){
                    min = el.result.length;
                }
            }
        });
        data.forEach(function(el){
            if(el.result.length == min){
                result.push(el.state);
            };
        });
        return result;
    }

    var getRes = function(obj, action, agent, state, stateIdx){
        var result = [], newFunc = [], res0Func = [], resFunc = [];
        for(var i=0; i<stateIdx.length; i++){
            if(processFormula(obj, stateIdx[i].value)){
                result.push(stateIdx[i].name);
            }
        };
        if(result.length){
            var tmpObj = createObj(['action', 'agent', 'state', 'result'], [action, agent, state.name, result]);
            res0Func.push(tmpObj);
            var compare = [];
            result.forEach(function(el){
                for(var i=0; i<stateIdx.length; i++){
                    if(stateIdx[i].name.toUpperCase() == el.toUpperCase()){
                        compare.push({state: el, result: compareState(state.value, stateIdx[i].value, action, agent)});
                        break;
                    }
                }
            });
            var tmpObj = createObj(['action', 'agent', 'state', 'compare'], [action, agent, state.name, compare]);
            newFunc.push(tmpObj);
            var tmpObj = createObj(['action', 'agent', 'state', 'result'], [action, agent, state.name, getMinRes(compare)]);
            resFunc.push(tmpObj);
        }
        else{
            var tmpObj = createObj(['action', 'agent', 'state', 'result'], [action, agent, state.name, null]);
            res0Func.push(tmpObj);
            resFunc.push(tmpObj);
            var tmpObj = createObj(['action', 'agent', 'state', 'compare'], [action, agent, state.name, null]);
            newFunc.push(tmpObj);
        }
        return {
            res0Func: res0Func,
            resFunc: resFunc,
            newFunc: newFunc
        }
    };

    var subCalculation = function(action, agent, state, stateIdx){
        var newFunc = [], res0Func = [], resFunc = [];
        if(calculateImpossible(action, agent, state.value)){
            var tmpObj = createObj(['action', 'agent', 'state', 'result'], [action, agent, state.name, null]);
            res0Func.push(tmpObj);
            resFunc.push(tmpObj);
            var tmpObj = createObj(['action', 'agent', 'state', 'compare'], [action, agent, state.name, null]);
            newFunc.push(tmpObj);
        }
        else{
            var sequence = calculateSequence([[action,agent]]);
            var possible = calculatePossible(action, agent, state);
            var statusPossible = false, statusSequence = false;
            var formulaPossible = [], formulaSequence = [];
            for(var i=0; i<sequence.length; i++){
                if(!sequence[i]){
                    statusSequence = true;
                }
                else{
                    formulaSequence.push({formula : sequence[i]});
                }
            }
            formulaSequence = mergeFormula(formulaSequence);
            for(var i=0; i<possible.length; i++){
                if(!possible[i]){
                    statusPossible = true;
                }
                else{
                    formulaPossible.push({formula: possible[i]});
                }
            }
            formulaPossible = mergeFormula(formulaPossible);
            var completeFormula = mergeFormula([{formula: [formulaPossible, "&",  formulaSequence]}]);
            if((statusPossible && possible.length == 1) || (statusSequence && sequence.length == 1)){
                var tmpObj = createObj(['action', 'agent', 'state', 'result'], [action, agent, state.name, [state.name]]);
                res0Func.push(tmpObj);
                resFunc.push(tmpObj);
                var tmpObj = createObj(['action', 'agent', 'state', 'compare'], [action, agent, state.name, null]);
                newFunc.push(tmpObj);
            }
            else{
                var resValue = getRes(completeFormula, action, agent, state, stateIdx);
                res0Func.push(...resValue.res0Func);
                resFunc.push(...resValue.resFunc);
                newFunc.push(...resValue.newFunc);
            }
        };
        return {
            res0Func: res0Func,
            resFunc: resFunc,
            newFunc: newFunc
        }
    };

    var calculateScenario = function(){
        listObjects.state.forEach(function(elem){
            var newFunc = [], res0Func = [], resFunc = [];
            listObjects.action.forEach(function(i){
                if(listObjects.agent.length){
                    listObjects.agent.forEach(function(j){
                        elem.value.forEach(function(k){
                            var resValue = subCalculation(i, j, k, elem.value);
                            res0Func.push(...resValue.res0Func);
                            resFunc.push(...resValue.resFunc);
                            newFunc.push(...resValue.newFunc);
                        });
                    });
                }
                else{
                    elem.value.forEach(function(j){
                        var resValue = subCalculation(i, null, j, elem.value);
                        res0Func.push(...resValue.res0Func);
                        resFunc.push(...resValue.resFunc);
                        newFunc.push(...resValue.newFunc);
                    });   
                }
            });
            listObjects.res0Calc.push(createObj(['model', 'value'], [elem.model, res0Func]));
            listObjects.resCalc.push(createObj(['model', 'value'], [elem.model, resFunc]));
            listObjects.newCalc.push(createObj(['model', 'value'], [elem.model, newFunc]));
        });
    };

    var parseScenario = function(obj){
        var splittedObj = obj.split(' ').filter(function(el){
            if(el!=""){
                return el;
            }
        });
        if(splittedObj.length){
            var posi = -1;
            var posj = -1;
            for(var i=0; i<splittedObj.length; i++){
                for(var j=0; j<languageStatements.length; j++){
                    if(splittedObj[i].toUpperCase() == languageStatements[j].name.toUpperCase()){
                        posi=i;
                        posj=j;
                        break;
                    }
                };
                if(posj!=-1){
                    break;
                }
            };
            if(posj!=-1){
                var beforeScenario = copyArray(splittedObj, 0, posi);
                var afterScenario = copyArray(splittedObj, posi+1);
                if(languageStatements[posj].both){
                    if(!(beforeScenario.length && afterScenario.length)){
                        setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect`);
                    };
                }
                else{
                    if(!afterScenario.length){
                        setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect`);
                    };
                }
                if(languageStatements[posj].after){
                    if(languageStatements[posj].after.join){
                        var positionsAfter = getJoinPosition(afterScenario, languageStatements[posj].after.join);
                        if(positionsAfter.length <= languageStatements[posj].after.join.length){
                            if(positionsAfter.length){
                                var datajoin = dataJoin(afterScenario, positionsAfter);
                                datajoin.before.forEach(function(el, idx){
                                    filterJoin(el, positionsAfter, idx, posj, 'after', 'before');
                                });
                                datajoin.after.forEach(function(el, idx){
                                    filterJoin(el, positionsAfter, idx, posj, 'after', 'after');
                                });
                            }
                            else{
                                afterScenario.forEach(function(el){
                                    filterObj(el, posj, 'after');
                                });
                            }
                        }
                        else{
                            setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect`);
                        }
                    }
                    else{
                        if(languageStatements[posj].after.obj == 'Program'){
                            var programs = getPrograms(afterScenario);
                            if(programs.status){
                                programs.value.forEach(function(el){
                                    filterObj(el, posj, 'after');
                                });
                            }
                        }
                        else{
                            afterScenario.forEach(function(el){
                                filterObj(el, posj, 'after');
                            });
                        }
                    }
                };
                if(languageStatements[posj].before){
                    if(languageStatements[posj].before.join){
                        var positionsBefore = getJoinPosition(beforeScenario, languageStatements[posj].before.join);
                        if(positionsBefore.length <= languageStatements[posj].before.join.length){
                            if(positionsBefore.length){
                                var datajoin = dataJoin(beforeScenario, positionsBefore);
                                datajoin.before.forEach(function(e, idx){
                                    filterJoin(e, positionsBefore, idx, posj, 'before', 'before');
                                });
                                datajoin.after.forEach(function(e, idx){
                                    filterJoin(e, positionsBefore, idx, posj, 'before', 'after');
                                });
                            }
                            else{
                                beforeScenario.forEach(function(el){
                                    filterObj(el, posj, 'before');
                                });
                            }
                        }
                        else{
                            setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect`);
                        }
                    }
                    else{
                        beforeScenario.forEach(function(el){
                            filterObj(el, posj, 'before');
                        });
                    }
                };
                if(languageStatements[posj].action){
                    if(languageStatements[posj].action == 'Sequence'){
                        if(beforeScenario.length && afterScenario.length){
                            var err = false;
                            var formula = getFormula(beforeScenario);
                            var programs = getPrograms(afterScenario);
                            if(!formula.status || !programs.status){
                                err=true;
                                setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect`);
                            }
                            if(!err){
                                var tmpObj = createObj(['programs', 'formula'], [programs.value, formula.value]);
                                statements[languageStatements[posj].action].push(tmpObj);
                            }
                        }
                    }
                    else if(languageStatements[posj].action == 'Constraint'){
                        if(afterScenario.length){
                            var formula={value:[], status:true}, err = false;
                            formula = getFormula(afterScenario);
                            if(!formula.status){
                                err = true;
                                setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect`);
                            }
                            if(!err){
                                var tmpObj = createObj(['formula'], [formula.value]);
                                statements[languageStatements[posj].action].push(tmpObj);
                            }
                        }
                    }
                    else if(languageStatements[posj].action == 'Noninertial'){
                        if(afterScenario.length){
                            var tmpNoninertial = null;
                            if(afterScenario.length == 1){
                                afterScenario.forEach(function(el){
                                    if(!isInArray(el, generalConnector)){
                                        if(el.includes('~')){
                                            setMessages(`The negation of FLUENT found. ${languageStatements[posj].name.toUpperCase()} statement should only with FLUENT`);
                                        }
                                        else{
                                            tmpNoninertial = el;
                                        }
                                    }
                                    else{
                                        setMessages(`There is no FLUENT found in ${languageStatements[posj].name.toUpperCase()} statement`);
                                    }
                                });
                                if(tmpNoninertial){
                                    if(!isInArray(tmpNoninertial, statements[languageStatements[posj].action])){
                                        statements[languageStatements[posj].action].push(tmpNoninertial);
                                    }
                                }
                            }
                            else{
                                setMessages(`There are more than a FLUENT found in ${languageStatements[posj].name.toUpperCase()} statement. Should only contain a FLUENT`);
                            }
                        }
                    }
                    else if(languageStatements[posj].action == 'Impossible'){
                        if(afterScenario.length){
                            var positionsAfter = getJoinPosition(afterScenario, languageStatements[posj].after.join);
                            var agent = null, action = null, formula={value:[], status:true}, err = false;
                            if(positionsAfter.length){
                                var datajoin = dataJoin(afterScenario, positionsAfter);
                                positionsAfter.forEach(function(el, idx){
                                    if(el.statement.toUpperCase() == 'BY'){
                                        if(datajoin.before[idx].length == 1 && datajoin.after[idx].length == 1){
                                            datajoin.before[idx].forEach(function(e){
                                                action = e;
                                            });
                                            datajoin.after[idx].forEach(function(e){
                                                agent = e;
                                            });
                                        }
                                        else{
                                            err = true;
                                            setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect, only an AGENT and an ACTION are allowed`);
                                        }
                                    }
                                    else{
                                        if(positionsAfter.length==1){
                                            datajoin.before[idx].forEach(function(e){
                                                action = e;
                                            });
                                        }
                                        if(!datajoin.after[idx].length){
                                            err = true;
                                            setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect. ${positionsAfter[idx].statement.toUpperCase()} statement found but there is no value`);
                                        }
                                        formula = getFormula(datajoin.after[idx]);
                                    }
                                });
                            }
                            else{
                                if(afterScenario.length == 1){
                                    afterScenario.forEach(function(el){
                                        action = el;
                                    });
                                }
                                else{
                                    err = true;
                                    setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect, only an ACTION is allowed`);
                                }
                            }
                            if(!formula.status){
                                err = true;
                                setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect`);
                            }
                            if(!err){
                                var tmpObj = createObj(['agent', 'action', 'formula'], [agent, action, formula.value]);
                                statements[languageStatements[posj].action].push(tmpObj);
                            }
                        }
                    }
                    else{
                        if(beforeScenario.length && afterScenario.length){    
                            var positionsBefore = getJoinPosition(beforeScenario, languageStatements[posj].before.join);
                            var positionsAfter = getJoinPosition(afterScenario, languageStatements[posj].after.join);
                            var agent = null, action = null, random = false, err = false;
                            var formulaEffect = {value:[], status:true}, formulaPrecondition = {value:[], status:true};
                            if(positionsBefore.length){
                                var dataJoinBefore = dataJoin(beforeScenario, positionsBefore);
                                positionsBefore.forEach(function(el, idx){
                                    if(dataJoinBefore.before[idx].length == 1 && dataJoinBefore.after[idx].length == 1){
                                        dataJoinBefore.before[idx].forEach(function(e){
                                            action = e;
                                        });
                                        dataJoinBefore.after[idx].forEach(function(e){
                                            agent = e;
                                        });
                                    }
                                    else{
                                        err = true;
                                        setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect, only an AGENT and an ACTION are allowed`);
                                    }
                                });
                            }
                            else{
                                if(beforeScenario.length == 1){
                                    beforeScenario.forEach(function(el){
                                        if(!isInArray(el, generalConnector)){
                                            action = el;
                                        }
                                        else{
                                            err = true;
                                            setMessages(`There is no ACTION found in ${languageStatements[posj].name.toUpperCase()} statement`);
                                        }
                                    });
                                }
                                else{
                                    err = true;
                                    setMessages(`There are more than an ACTION found in ${languageStatements[posj].name.toUpperCase()} statement. Should only contain an ACTION`);
                                }
                            }
    
                            if(positionsAfter.length){
                                var dataJoinAfter = dataJoin(afterScenario, positionsAfter);
                                if(languageStatements[posj].after.random){
                                    dataJoinAfter.before.forEach(function(el){
                                        if(el.length == 1){
                                            el.forEach(function(e){
                                                if(!isInArray(e, generalConnector)){
                                                    if(e.includes('~')){
                                                        err = true;
                                                        setMessages(`The negation of FLUENT found. ${languageStatements[posj].name.toUpperCase()} statement should only with FLUENT`);
                                                    }
                                                    else{
                                                        formulaEffect.value = [e, '|', `~${e}`];
                                                        formulaEffect.status = true;
                                                    }
                                                }
                                                else{
                                                    err = true;
                                                    setMessages(`There is no FLUENT found in ${languageStatements[posj].name.toUpperCase()} statement`);
                                                }
                                            });
                                        }
                                        else{
                                            err = true;
                                            setMessages('There are more than a FLUENT found. Only a FLUENT is allowed');
                                        }
                                    });
                                    dataJoinAfter.after.forEach(function(el, idx){
                                        if(!el.length){
                                            err = true;
                                            setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect. ${positionsAfter[idx].statement.toUpperCase()} statement found but there is no value`);
                                        }
                                        formulaPrecondition = getFormula(el);
                                    });
                                    random = true;
                                }
                                else{
                                    dataJoinAfter.before.forEach(function(el){
                                        formulaEffect = getFormula(el);
                                    });
                                    dataJoinAfter.after.forEach(function(el, idx){
                                        if(!el.length){
                                            err = true;
                                            setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect. ${positionsAfter[idx].statement.toUpperCase()} statement found but there is no value`);
                                        }
                                        formulaPrecondition = getFormula(el);
                                    });
                                }
                            }
                            else{
                                if(languageStatements[posj].after.random){
                                    if(afterScenario.length == 1){
                                        afterScenario.forEach(function(el){
                                            if(!isInArray(el, generalConnector)){
                                                if(el.includes('~')){
                                                    err = true;
                                                    setMessages(`The negation of FLUENT found. ${languageStatements[posj].name.toUpperCase()} statement should only with FLUENT`);
                                                }
                                                else{
                                                    formulaEffect.value = [el, '|', `~${el}`];
                                                    formulaEffect.status = true;
                                                }
                                            }
                                            else{
                                                err = true;
                                                setMessages(`There is no FLUENT found in ${languageStatements[posj].name.toUpperCase()} statement`);
                                            }
                                        });
                                    }
                                    else{
                                        err = true;
                                        setMessages('There are more than a FLUENT found. Only a FLUENT is allowed');
                                    }
                                    random = true;
                                }
                                else{
                                    formulaEffect = getFormula(afterScenario);
                                }
                            }
                            if(!(formulaEffect.status && formulaPrecondition.status)){
                                err = true;
                                setMessages(`The ${languageStatements[posj].name.toUpperCase()} statement is incorrect`);
                            }
                            if(!err){
                                var tmpObj = createObj(['agent', 'action', 'formula_precondition', 'formula_effect', 'random'], [agent, action, formulaPrecondition.value, formulaEffect.value, random]);
                                statements[languageStatements[posj].action].push(tmpObj);
                            }
                        }
                    }
                }                
            }
            else{
                setMessages('The scenario you entered is incorrect. Please write the correct one');
            }
        }
    };

    var setDefaultObj = function(obj){
        if(typeof(obj) == 'object'){
            return [];
        }
        else if(typeof(obj) == 'string'){
            return '';
        }
        else if(typeof(obj) == 'number'){
            return 0;
        }
        else{
            return null;
        }
    };

    var checkObj = function(obj, name){
        var status = true;
        if(name.toUpperCase() == 'PROGRAM'){ 
            obj.forEach(function(el){
                if(el.length == 1){
                    if(!isInArray(el[0], listObjects.action)){
                        status = false;
                    }
                }
                else{
                    if(!isInArray(el[0], listObjects.action)){
                        status = false;
                    }
                    if(!isInArray(el[1], listObjects.agent)){
                        status = false;
                    }
                }
            });
        }
        else if(name.toUpperCase() == 'STATE'){
            var states = [];
            listObjects.state[0].value.forEach(function(el){
                states.push(el.name);
            });
            obj.forEach(function(el){
                if(!isInArray(el, states)){
                    status = false;
                }
            });
        }
        else if(name.toUpperCase() == 'AGENT'){
            obj.forEach(function(el){
                if(!isInArray(el, generalConnector)){
                    if(!isInArray(el, listObjects.agent)){
                        status = false;
                    }
                }
            });
        }
        else{
            obj.forEach(function(el){
                if(!isInArray(el, generalConnector)){
                    if(!isInArray(el, listObjects.fluent)){
                        status = false;
                    }
                }
            });
            var count = countLogic(0, 0, obj);
            var countFluent = count.fluent, countConnector = count.connector;
            if(countFluent || countConnector){
                if(countFluent-countConnector!=1){
                    status=false;
                }
            }
        }
        return status;
    };

    var filterNegation = function(obj){
        var result = [];
        obj.forEach(function(el){
            if(el.includes('~')){
                result.push(el.substring(1));
            }
            else{
                result.push(el);
            }
        });
        return result;
    }

    var parseQuery = function(obj){
        var splittedObj = obj.split(' ').filter(function(el){
            if(el!=""){
                return el;
            }
        });
        if(splittedObj.length){
            var posi = -1;
            var posj = -1;
            for(var i=0; i<splittedObj.length; i++){
                for(var j=0; j<queryStatements.length; j++){
                    if(splittedObj[i].toUpperCase() == queryStatements[j].name.toUpperCase()){
                        posi=i;
                        posj=j;
                        break;
                    }
                };
                if(posj!=-1){
                    break;
                }
            };
            if(posj!=-1){
                var beforeQuery = copyArray(splittedObj, 0, posi);
                var afterQuery = copyArray(splittedObj, posi+1);
                var necessary = true;
                var source = null;
                var data = null;
                var goal = null;
                if(queryStatements[posj].both){
                    if(!(beforeQuery.length && afterQuery.length)){
                        setMessages(`The query ${queryStatements[posj].name.toUpperCase()} is incorrect`);
                    };
                    if(beforeQuery.length){
                        necessary = !isInArray('possibly', beforeQuery) && !isInArray('ever', beforeQuery);
                    }
                }
                else{
                    if(!afterQuery.length){
                        setMessages(`The query ${queryStatements[posj].name.toUpperCase()} is incorrect`);
                    };
                    if(beforeQuery.length){
                        necessary = !isInArray('possibly', beforeQuery) && !isInArray('ever', beforeQuery);
                    }
                }
                if(queryStatements[posj].after){
                    if(queryStatements[posj].after.join){
                        var positionsAfter = getJoinPosition(afterQuery, queryStatements[posj].after.join);
                        if(positionsAfter.length <= queryStatements[posj].after.join.length){
                            if(positionsAfter.length){
                                var datajoin = dataJoin(afterQuery, positionsAfter);
                                datajoin.after.forEach(function(el, idx){
                                    if(el.length){
                                        if(el.length>1){
                                            setMessages(`After ${queryStatements[posj].after.join[idx].name.toUpperCase()} only one ${queryStatements[posj].after.join[idx].after.toUpperCase()} is allowed`);
                                        }
                                        else{
                                            if(!checkObj(el, queryStatements[posj].after.join[idx].after)){
                                                setMessages(`After ${queryStatements[posj].after.join[idx].name.toUpperCase()} should only be ${queryStatements[posj].after.join[idx].after.toUpperCase()}`);
                                            }
                                            else{
                                                source = el;
                                            }
                                        }
                                    }
                                    else{
                                        setMessages(`Nothing found after ${queryStatements[posj].after.join[idx].name.toUpperCase()}`);
                                    }

                                });
                                datajoin.before.forEach(function(el, idx){
                                    if(el.length){
                                        if(queryStatements[posj].after.join[idx].before.toUpperCase() == 'PROGRAM'){
                                            var program = getPrograms(el);
                                            if(program.status){
                                                if(!checkObj(program.value, queryStatements[posj].after.join[idx].before)){
                                                    setMessages(`${queryStatements[posj].after.join[idx].before.toUpperCase()} is incorrect`);
                                                }
                                                else{
                                                    data = program.value;
                                                }
                                            }
                                            else{
                                                setMessages(`${queryStatements[posj].after.join[idx].before.toUpperCase()} is incorrect`);
                                            }
                                        }
                                        else{
                                            if(!checkObj(filterNegation(el), queryStatements[posj].after.join[idx].before)){
                                                setMessages(`Before ${queryStatements[posj].after.join[idx].name.toUpperCase()} should only be ${queryStatements[posj].after.join[idx].before.toUpperCase()}`);
                                            }
                                            else{
                                                data = el;
                                            }
                                        }
                                    }
                                    else{
                                        setMessages(`There is no ${queryStatements[posj].after.join[idx].before.toUpperCase()} found`);
                                    }
                                });
                            }
                            else{
                                if(queryStatements[posj].after.obj.toUpperCase() == 'PROGRAM'){
                                    var program = getPrograms(afterQuery);
                                    if(program.status){
                                        if(!checkObj(program.value, queryStatements[posj].after.obj)){
                                            setMessages(`${queryStatements[posj].after.obj.toUpperCase()} is incorrect`);
                                        }
                                        else{
                                            data = program.value;
                                        }
                                    }
                                    else{
                                        setMessages(`${queryStatements[posj].after.obj.toUpperCase()} is incorrect`);
                                    }
                                }
                                else{
                                    if(!checkObj(filterNegation(afterQuery), queryStatements[posj].after.obj)){
                                        setMessages(`After ${queryStatements[posj].name.toUpperCase()} should only be ${queryStatements[posj].after.obj.toUpperCase()}`);
                                    }
                                    else{
                                        data = afterQuery;
                                    }
                                }
                            }
                        }
                        else{
                            setMessages(`The query ${queryStatements[posj].name.toUpperCase()} is incorrect`);
                        }
                    }
                    else{
                        if(queryStatements[posj].after.obj.toUpperCase() == 'PROGRAM'){
                            var program = getPrograms(afterQuery);
                            if(program.status){
                                if(!checkObj(program.value, queryStatements[posj].after.obj)){
                                    setMessages(`${queryStatements[posj].after.obj.toUpperCase()} is incorrect`);
                                }
                                else{
                                    data = program.value;
                                }
                            }
                            else{
                                setMessages(`${queryStatements[posj].after.obj.toUpperCase()} is incorrect`);
                            }
                        }
                        else{
                            if(!checkObj(filterNegation(afterQuery), queryStatements[posj].after.obj)){
                                setMessages(`After ${queryStatements[posj].name.toUpperCase()} should only be ${queryStatements[posj].after.obj.toUpperCase()}`);
                            }
                            else{
                                data = afterQuery;
                            }
                        }                        
                    }
                }
                if(queryStatements[posj].before){
                    beforeQuery = beforeQuery.filter(function(el){
                        if(!isInArray(el, queryType)){
                            return el;
                        }
                    });
                    if(queryStatements[posj].before.obj.toUpperCase() == 'PROGRAM'){
                        var program = getPrograms(beforeQuery);
                        if(program.status){
                            if(!checkObj(program.value, queryStatements[posj].before.obj)){
                                setMessages(`${queryStatements[posj].before.obj.toUpperCase()} is incorrect`);
                            }
                            else{
                                goal = program.value;
                            }
                        }
                        else{
                            setMessages(`${queryStatements[posj].before.obj.toUpperCase()} is incorrect`);
                        }
                    }
                    else{
                        if(queryStatements[posj].before.obj.toUpperCase() == 'AGENT' && beforeQuery.length > 1){
                            setMessages(`Before ${queryStatements[posj].name.toUpperCase()} only one ${queryStatements[posj].before.obj.toUpperCase()} is allowed`);
                        }
                        else{
                            if(!checkObj(filterNegation(beforeQuery), queryStatements[posj].before.obj)){
                                setMessages(`Before ${queryStatements[posj].name.toUpperCase()} should only be ${queryStatements[posj].before.obj.toUpperCase()}`);
                            }
                            else{
                                goal = beforeQuery;
                            }
                        }
                    }
                }
                if(!source){
                    source = [listObjects.state[0].value[0].name];
                }
                return {
                    type: necessary,
                    source: source,
                    data: data,
                    goal: goal,
                    query: queryStatements[posj].name
                }
            }
            else{
                setMessages('The query you entered is incorrect. Please write the correct one');
            }
        }
    };

    var findRes = function(action, agent, state, resFunc){
        var result = [];
        resFunc.forEach(function(el){
            if(agent){
                if(el.action.toUpperCase() == action.toUpperCase() && el.agent.toUpperCase() == agent.toUpperCase() && el.state.toUpperCase() == state.toUpperCase()){
                    if(el.result != null){
                        result.push(...el.result);
                    }
                }
            }
            else{
                if(el.action.toUpperCase() == action.toUpperCase() && el.state.toUpperCase() == state.toUpperCase()){
                    if(el.result != null){
                        result.push(...el.result);
                    }
                }
            }
        });
        return result;
    }

    var filterData  = function(obj){
        var result = [];
        obj.forEach(function(el){
            if(el){
                if(!isInArray(el, result)){
                    result.push(el);
                };
            }
            else{
                result.push(el);
            }
        });
        return result;
    }

    var getResult = function(data, source, resFunc){
        var resultStates = [];
        var resultLogics = [];
        data.forEach(function(el, idx){
            if(idx == 0){
                var logics = [];
                var states = [];
                if(el.length == 1){
                    var res = findRes(el[0], null, source, resFunc);
                    if(res.length){
                        logics.push(true);
                    }
                    else{
                        logics.push(false);
                    }
                    states.push(filterData(res));
                }
                else{
                    var res = findRes(el[0], el[1], source, resFunc);
                    if(res.length){
                        logics.push(true);
                    }
                    else{
                        logics.push(false);
                    }
                    states.push(filterData(res));
                }
                if(idx==data.length-1){
                    resultLogics.push(logics);
                    resultStates.push(states);
                }
                else{
                    resultLogics.push(...logics);
                    resultStates.push(...states);
                }
            }
            else{
                var states = [];
                var logics = [];
                if(el.length == 1){
                    if(idx != data.length-1){
                        resultStates[idx-1].forEach(function(e){
                            var res = findRes(el[0], null, e, resFunc);
                            if(res.length){
                                logics.push(true);
                            }
                            else{
                                logics.push(false);
                            }
                            states.push(...res);
                        });
                        resultLogics.push(...logics);
                        resultStates.push(filterData(states));
                    }
                    else{
                        resultStates[idx-1].forEach(function(e){
                            var res = findRes(el[0], null, e, resFunc);
                            if(res.length){
                                logics.push(true);
                            }
                            else{
                                logics.push(false);
                            }
                            states.push(res);
                        });
                        resultLogics.push(logics);
                        resultStates.push(states);
                    }
                }
                else{
                    if(idx != data.length-1){
                        resultStates[idx-1].forEach(function(e){
                            var res = findRes(el[0], el[1], e, resFunc);
                            if(res.length){
                                logics.push(true);
                            }
                            else{
                                logics.push(false);
                            }
                            states.push(...res);
                        });
                        resultLogics.push(...logics);
                        resultStates.push(filterData(states));
                    }
                    else{
                        resultStates[idx-1].forEach(function(e){
                            var res = findRes(el[0], el[1], e, resFunc);
                            if(res.length){
                                logics.push(true);
                            }
                            else{
                                logics.push(false);
                            }
                            states.push(res);
                        });
                        resultLogics.push(logics);
                        resultStates.push(states);
                    }
                }
            }
        });
        return {
            logic : resultLogics,
            state : resultStates
        };
    };

    var checkResultExecutable = function(data, type){
        var result = [];
        var status = null;
        if(type){
            data.forEach(function(elem){
                status = true;
                elem.logic.forEach(function(el, idx){
                    if(idx == elem.logic.length-1){
                        el.forEach(function(e){
                            if(!e){
                                status = false;
                            }
                        });
                    }
                    else{
                        if(!el){
                            status = false;
                        }
                    }
                });
                result.push(status);
            });
        }
        else{
            data.forEach(function(elem){
                status = false;
                elem.logic[elem.logic.length-1].forEach(function(el){
                    if(el){
                        status = true;
                    }
                });
                result.push(status);
            });
        };
        var finalStatus = null;
        if(type){
            finalStatus = true;
            result.forEach(function(el){
                if(!el){
                    finalStatus = false;
                }
            });
        }
        else{
            finalStatus = false;
            result.forEach(function(el){
                if(el){
                    finalStatus = true;
                }
            });
        }
        return finalStatus;
    };

    var checkResultAfter = function(data, target, type, obj){
        var result = [];
        data.forEach(function(elem, idx){
            var status = false;
            if(!status){
                var count = 0;
                elem.state[obj.length-1].forEach(function(el){
                    el.forEach(function(e){
                        listObjects.state[idx].value.forEach(function(ele){
                            if(ele.name.toUpperCase() == e.toUpperCase()){
                                if(processFormula(target, ele.value)){
                                    count++;
                                }
                            }
                        });
                    });
                });
                if(type){
                    if(elem.state[obj.length-1].length == count){
                        status = true;
                    }
                    if(elem.state[obj.length-1][elem.state[obj.length-1].length-1].length > 1){
                        status = false;
                    }
                }
                else{
                    if(count != 0){
                        status = true;
                    }
                }
            }
            result.push(status);
        });
        var finalStatus = null;
        if(type){
            finalStatus = true;
            result.forEach(function(el){
                if(!el){
                    finalStatus = false;
                }
            });
        }
        else{
            finalStatus = false;
            result.forEach(function(el){
                if(el){
                    finalStatus = true;
                }
            });
        }
        return finalStatus;
    };

    var checkResultAccessible = function(obj){
        var result = [];
        obj.source.forEach(function(elem){
            listObjects.state.forEach(function(element){
                var statusRelease = false, statusExist = false;
                element.value.forEach(function(el){
                    if(el.name.toUpperCase() == elem.toUpperCase()){
                        if(processFormula(obj.data, el.value)){
                            var newObj = [];
                            for(var i=0; i<obj.data.length; i++){
                                if(!isInArray(obj.data[i], generalConnector)){
                                    newObj.push(obj.data[i]);
                                }
                            }
                            newObj.forEach(function(e){
                                for(var i=0; i<statements.Possible.length; i++){
                                    if(statements.Possible[i].random){
                                        if(isInArray(e, statements.Possible[i].formula_effect)){
                                            statusRelease = true;
                                        }
                                    }
                                }
                            });
                            statusExist = true;
                        }
                        else{
                            statusExist = false;
                        }
                    }
                });
                if(obj.type){
                    if(statusExist && !statusRelease){
                        result.push(true);
                    }
                    else{
                        result.push(false);
                    }
                }
                else{
                    if(statusExist){
                        result.push(true);
                    }
                    else{
                        result.push(false);
                    }
                }
            });
        });
        var finalStatus = null;
        if(obj.type){
            finalStatus = true;
            result.forEach(function(el){
                if(!el){
                    finalStatus = false;
                }
            });
        }
        else{
            finalStatus = false;
            result.forEach(function(el){
                if(el){
                    finalStatus = true;
                }
            });
        }
        return finalStatus;
    };

    var checkResultInvolvedIn = function(obj, type, goal, data){
        var result = [];
        obj.forEach(function(element, idx){
            var status = false;
            data.forEach(function(el){
                if(el.length > 1){
                    if(goal.toUpperCase() == el[1].toUpperCase()){
                        status = true;
                    }
                }
            });
            if(status){
                if(type){
                    status = true;
                    element.state.forEach(function(el){
                        el.forEach(function(e){
                            if(!e){
                                status = false;
                            }
                        });
                    });
                    if(status){
                        statements.Possible.forEach(function(elem){
                            if(elem.agent.toUpperCase() == goal.toUpperCase() && elem.action.toUpperCase() == data[data.length-1][0].toUpperCase()){
                                element.state[element.state.length-1].forEach(function(el){
                                    el.forEach(function(ele){
                                        listObjects.state[idx].value.forEach(function(e){
                                            if(ele.toUpperCase() == e.name.toUpperCase()){
                                                if(!processFormula(elem.formula_effect, e.value)){
                                                    status = false;
                                                }
                                            }
                                        });
                                    });
                                });
                            }
                        });
                    }
                }
                else{
                    status = false;
                    statements.Possible.forEach(function(elem){
                        if(elem.agent.toUpperCase() == goal.toUpperCase()){
                            element.state[element.state.length-1].forEach(function(el){
                                listObjects.state[idx].value.forEach(function(e){
                                    if(el.toUpperCase() == e.name.toUpperCase()){
                                        if(processFormula(elem.formula_effect, e.value)){
                                            status = true;
                                        }
                                    }
                                });
                            });
                        }
                    });
                }   
            }
            result.push(status);
        });
        var finalStatus = null;
        if(type){
            finalStatus = true;
            result.forEach(function(el){
                if(!el){
                    finalStatus = false;
                }
            });
        }
        else{
            finalStatus = false;
            result.forEach(function(el){
                if(el){
                    finalStatus = true;
                }
            });
        }
        return finalStatus;
    };

    var calculateQuery = function(obj){
        var status = null;
        if(obj.query == 'Executable'){
            obj.source.forEach(function(el){
                var result = [];
                listObjects.resCalc.forEach(function(e){
                    result.push(getResult(obj.data, el, e.value));
                });
                console.log(result);
                if(checkResultExecutable(result, obj.type)){
                    status = 'True';
                }
                else{
                    status = 'False';
                };
            });
        }
        else if(obj.query == 'Accessible'){
            if(checkResultAccessible(obj)){
                status = 'True';
            }
            else{
                status = 'False';
            };
        }
        else if(obj.query == 'After'){
            obj.source.forEach(function(el){
                var result = [];
                listObjects.resCalc.forEach(function(e){
                    result.push(getResult(obj.data, el, e.value));
                });
                console.log(result);
                if(checkResultAfter(result, obj.goal, obj.type, obj.data)){
                    status = 'True';
                }
                else{
                    status = 'False';
                };
            });
        }
        else{
            obj.source.forEach(function(el){
                var result = [];
                listObjects.resCalc.forEach(function(e){
                    result.push(getResult(obj.data, el, e.value));
                });
                console.log(result);
                obj.goal.forEach(function(e){
                    if(checkResultInvolvedIn(result, obj.type, e, obj.data)){
                        status = 'True';
                    }
                    else{
                        status = 'False';
                    };
                });
            });
        }
        return status;
    };

    return{
        setObj : function(value, name){
            listObjects[name] = value;
        },
        setListCalculations: function(obj, typeObj='normal', state=false, newCalc = false){
            return setListCalculations(obj, typeObj, state, newCalc);
        },
        setMessage : function(message){
            setMessages(message);
        },
        setDisplayCalc : function(data){
            listObjects.displayCalc.push(data);
        },
        getObjects : function(){
            return listObjects;
        },
        getStatements : function(){
            return statements;
        },
        parseScenario: function(obj){
            parseScenario(obj);
        },
        parseQuery: function(obj){
            return parseQuery(obj);
        },
        generateStates : function(obj, inits){
            return generateStates(obj, inits);
        },
        genInitialState : function(init){
            return genInitialState(init);
        },
        inBracket : function(obj, typeObj = 'normal'){
            return inBracket(obj, typeObj);
        },
        checkScenario : function(){
            return checkScenario();
        },
        emptyList : function(){
            for(obj in listObjects){
                listObjects[obj] = setDefaultObj(listObjects[obj]);
            }
            for(obj in statements){
                statements[obj] = setDefaultObj(statements[obj]);
            }
        },
        calculateScenario: function(){
            calculateScenario();
        },
        clearMessage: function(){
            listObjects.messages = [];
        },
        calculateQuery: function(data){
            return calculateQuery(data);
        }
    }
})();