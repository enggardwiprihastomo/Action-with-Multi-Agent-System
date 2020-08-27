var MainController = (function(UIController, AlgorithmController){
    var DOM = UIController.DOM;
    var currentFocusScenario = -1, currentFocusQuery = -1;
    var autocompleteListScenario, cursorPositionScenarioStart, cursorPositionScenarioEnd, wordBlockScenario, autocompleteListQuery, cursorPositionQueryStart, cursorPositionQueryEnd, wordBlockQuery;
    var listStatements = ['Initially', 'Impossible', 'After', 'Causes', 'Releases', 'Always', 'If', 'Noninertial', 'By'];
    var listQueries = ['Possibly', 'After', 'From', 'Involved-In', 'Necessary', 'Executable', 'Accessible', 'By'];
    var autocompleteColors = ['autocomplete-red', 'autocomplete-blue', 'autocomplete-green', 'autocomplete-yellow', 'autocomplete-grey'];

    var setActiveBlock = function(position, objs){
        objs.forEach(function(e){
            e.classList.remove('active');
        });
        objs[position].classList.add('active');
    }

    var generateAutocomplete = function(listObj, currentCaretStart, currentCaretEnd, status = 'normal', key = 'normal', input = 'scenario'){
        if (input == 'scenario'){
            var obj=`<ul class='autocomplete-scenario'>`;
            if (key == 'shiftspace'){
                for(var i=0; i<listObj.length; i++){
                    var sortedObj = listObj[i].sort();
                    if (status == 'empty'){
                        for(var j=0; j<sortedObj.length; j++){
                            obj+=`<li class='autocomplete-list-scenario'><span class='${autocompleteColors[i]}'></span><input type='hidden' value='${sortedObj[j]}'><b>${sortedObj[j].substr(0, currentCaretStart-wordBlockScenario)}</b>${sortedObj[j].substr((currentCaretStart-wordBlockScenario), sortedObj[j].length)}</li>`;
                        }
                    }
                    else{
                        for(var j=0; j<sortedObj.length; j++){
                            if(DOM.inputScenario.value.substr(wordBlockScenario, currentCaretStart-wordBlockScenario).toUpperCase() == sortedObj[j].substr(0,currentCaretStart-wordBlockScenario).toUpperCase()){
                                obj+=`<li class='autocomplete-list-scenario'><span class='${autocompleteColors[i]}'></span><input type='hidden' value='${sortedObj[j]}'><b>${sortedObj[j].substr(0, currentCaretStart-wordBlockScenario)}</b>${sortedObj[j].substr((currentCaretStart-wordBlockScenario), sortedObj[j].length)}</li>`;
                            }
                        }
                    }
                }
            }
            else{
                for(var i=0; i<listObj.length; i++){
                    sortedObj = listObj[i].sort();
                    for(var j=0; j<sortedObj.length; j++){
                        if(DOM.inputScenario.value.substr(wordBlockScenario, currentCaretStart-wordBlockScenario).toUpperCase() != sortedObj[j].toUpperCase()){
                            if(DOM.inputScenario.value.substr(wordBlockScenario, currentCaretStart-wordBlockScenario).toUpperCase() == sortedObj[j].substr(0,currentCaretStart-wordBlockScenario).toUpperCase()){
                                obj+=`<li class='autocomplete-list-scenario'><span class='${autocompleteColors[i]}'></span><input type='hidden' value='${sortedObj[j]}'><b>${sortedObj[j].substr(0, currentCaretStart-wordBlockScenario)}</b>${sortedObj[j].substr((currentCaretStart-wordBlockScenario), sortedObj[j].length)}</li>`;
                            }
                        }
                        else{
                            obj=`<ul class='autocomplete-scenario'>`;
                            if(i == 0){
                                var substr = new RegExp(sortedObj[j], 'gi');
                                DOM.inputScenario.value=DOM.inputScenario.value.replace(substr, listObj[i][j].toUpperCase());
                            }
                            this.selectionStart = this.selectionEnd = currentCaretStart+1;
                        }
                    }
                }
            }
            obj+=`</ul>`;
            if(obj != `<ul class='autocomplete-scenario'></ul>`){
                UIController.insertObj(DOM.body, obj);
                autocompleteListScenario = document.querySelectorAll(".autocomplete-list-scenario");
                currentFocusScenario = 0;
                cursorPositionScenarioStart = currentCaretStart;
                cursorPositionScenarioEnd = currentCaretEnd;
                setActiveBlock(currentFocusScenario, autocompleteListScenario);
            }
        }
        else{
            var obj=`<ul class='autocomplete-query'>`;
            if (key == 'shiftspace'){
                for(var i=0; i<listObj.length; i++){
                    sortedObj = listObj[i].sort();
                    if (status == 'empty'){
                        for(var j=0; j<sortedObj.length; j++){
                            if(typeof(sortedObj[j]) == 'object'){
                                obj+=`<li class='autocomplete-list-query'><span class='${autocompleteColors[i]}'></span><input type='hidden' value='${sortedObj[j].name}'><b>${sortedObj[j].name.substr(0, currentCaretStart-wordBlockQuery)}</b>${sortedObj[j].name.substr((currentCaretStart-wordBlockQuery), sortedObj[j].name.length)}</li>`; 
                            }
                            else{
                                obj+=`<li class='autocomplete-list-query'><span class='${autocompleteColors[i]}'></span><input type='hidden' value='${sortedObj[j]}'><b>${sortedObj[j].substr(0, currentCaretStart-wordBlockQuery)}</b>${sortedObj[j].substr((currentCaretStart-wordBlockQuery), sortedObj[j].length)}</li>`;    
                            }
                        }
                    }
                    else{
                        for(var j=0; j<sortedObj.length; j++){
                            if(typeof(sortedObj[j]) == 'object'){
                                if(DOM.inputQuery.value.substr(wordBlockQuery, currentCaretStart-wordBlockQuery).toUpperCase() == sortedObj[j].name.substr(0,currentCaretStart-wordBlockQuery).toUpperCase()){
                                    obj+=`<li class='autocomplete-list-query'><span class='${autocompleteColors[i]}'></span><input type='hidden' value='${sortedObj[j].name}'><b>${sortedObj[j].name.substr(0, currentCaretStart-wordBlockQuery)}</b>${sortedObj[j].name.substr((currentCaretStart-wordBlockQuery), sortedObj[j].name.length)}</li>`;
                                }
                            }
                            else{
                                if(DOM.inputQuery.value.substr(wordBlockQuery, currentCaretStart-wordBlockQuery).toUpperCase() == sortedObj[j].substr(0,currentCaretStart-wordBlockQuery).toUpperCase()){
                                    obj+=`<li class='autocomplete-list-query'><span class='${autocompleteColors[i]}'></span><input type='hidden' value='${sortedObj[j]}'><b>${sortedObj[j].substr(0, currentCaretStart-wordBlockQuery)}</b>${sortedObj[j].substr((currentCaretStart-wordBlockQuery), sortedObj[j].length)}</li>`;
                                }
                            }
                        }
                    }
                }
            }
            else{
                for(var i=0; i<listObj.length; i++){
                    sortedObj = listObj[i].sort();
                    for(var j=0; j<sortedObj.length; j++){
                        if(typeof(sortedObj[j]) == 'object'){
                            if(DOM.inputQuery.value.substr(wordBlockQuery, currentCaretStart-wordBlockQuery).toUpperCase() != sortedObj[j].name.toUpperCase()){
                                if(DOM.inputQuery.value.substr(wordBlockQuery, currentCaretStart-wordBlockQuery).toUpperCase() == sortedObj[j].name.substr(0,currentCaretStart-wordBlockQuery).toUpperCase()){
                                    obj+=`<li class='autocomplete-list-query'><span class='${autocompleteColors[i]}'></span><input type='hidden' value='${sortedObj[j].name}'><b>${sortedObj[j].name.substr(0, currentCaretStart-wordBlockQuery)}</b>${sortedObj[j].name.substr((currentCaretStart-wordBlockQuery), sortedObj[j].name.length)}</li>`;
                                }
                            }
                            else{
                                obj=`<ul class='autocomplete-query'>`;
                                if(i == 0){
                                    var substr = new RegExp(sortedObj[j].name, 'gi');
                                    DOM.inputQuery.value=DOM.inputQuery.value.replace(substr, sortedObj[j].name.toUpperCase());
                                }
                                this.selectionStart = this.selectionEnd = currentCaretStart+1;
                            }
                        }
                        else{
                            if(DOM.inputQuery.value.substr(wordBlockQuery, currentCaretStart-wordBlockQuery).toUpperCase() != sortedObj[j].toUpperCase()){
                                if(DOM.inputQuery.value.substr(wordBlockQuery, currentCaretStart-wordBlockQuery).toUpperCase() == sortedObj[j].substr(0,currentCaretStart-wordBlockQuery).toUpperCase()){
                                    obj+=`<li class='autocomplete-list-query'><span class='${autocompleteColors[i]}'></span><input type='hidden' value='${sortedObj[j]}'><b>${sortedObj[j].substr(0, currentCaretStart-wordBlockQuery)}</b>${sortedObj[j].substr((currentCaretStart-wordBlockQuery), sortedObj[j].length)}</li>`;
                                }
                            }
                            else{
                                obj=`<ul class='autocomplete-query'>`;
                                if(i == 0){
                                    var substr = new RegExp(sortedObj[j], 'gi');
                                    DOM.inputQuery.value=DOM.inputQuery.value.replace(substr, sortedObj[j].toUpperCase());
                                }
                                this.selectionStart = this.selectionEnd = currentCaretStart+1;
                            }
                        }
                    }
                }
            }
            obj+=`</ul>`;
            if(obj != `<ul class='autocomplete-query'></ul>`){
                UIController.insertObj(DOM.queryWrapper, obj);
                autocompleteListQuery = document.querySelectorAll(".autocomplete-list-query");
                currentFocusQuery = 0;
                cursorPositionQueryStart = currentCaretStart;
                cursorPositionQueryEnd = currentCaretEnd;
                setActiveBlock(currentFocusQuery, autocompleteListQuery);
            }
        }
    }

    var generateList = function(data, calc){
        if(calc){
            var obj = `<div class="model-wrapper">`
            data.forEach(function(el){
                obj += `<ul class='listinfo-list-calculation fonttiny'>`;
                for(var i=0; i<el.length; i++){
                    obj+=`<li>${el[i]}</li>`;
                }
                obj+=`</ul>`;
            });
            obj+=`</div>`;
        }
        else{
            data = data.sort();
            var obj = `<ul class='listinfo-list fonttiny'>`;
            for(var i=0; i<data.length; i++){
                obj+=`<li>${data[i]}</li>`;
            }
            obj+=`</ul>`;
        }
        UIController.insertObj(DOM.listInfo, obj);
    }

    var saveTextAsFile = function(data){
        var textFileAsBlob = new Blob([data], {type:'text/plain'});
        var fileNameToSaveAs = "scenario.txt";
    
        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = "Download File";
        if (window.webkitURL != null)
        {
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        }
        else
        {
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }
        downloadLink.click();
    }

    DOM.btnStart.addEventListener('click', function(){
        DOM.content.style.display = 'block';
        setTimeout(function(){
            DOM.contentTitle.style.display = DOM.btnMenu.style.display = DOM.inputWrapper.style.display='block';
            DOM.inputScenario.focus();
        },500);
    });

    DOM.inputScenario.addEventListener('keyup', function(e){
        if (DOM.inputScenario.value.length){
            if (DOM.btnClear.style.display == ''){
                DOM.btnClear.style.display = 'block';
            }
        }else{
            if (DOM.btnClear.style.display == 'block'){
                DOM.btnClear.style.display = '';
            }
        }

        if((e.ctrlKey && e.keyCode == 32)){
            wordBlockScenario=0;
            autocompleteListScenario=null;
            for(var i=this.selectionStart-1; i>=0; i--){
                if(DOM.inputScenario.value[i] == ' ' || DOM.inputScenario.value[i] == '\n'){
                    wordBlockScenario=i+1;
                    break;
                }
            }
            if(document.querySelector('.autocomplete-scenario')){
                UIController.deleteObj(document.querySelector('.autocomplete-scenario'));
            }
            if(this.selectionStart-wordBlockScenario == 0){
                generateAutocomplete([listStatements], this.selectionStart, this.selectionEnd, 'empty', 'shiftspace');
            }
            else{
                generateAutocomplete([listStatements], this.selectionStart, this.selectionEnd, 'normal', 'shiftspace');
            }
        }
        else if(e.keyCode == 17){
            
        }
        else if(e.keyCode == 35 || e.keyCode == 36){
            if(document.querySelector('.autocomplete-scenario')){
                UIController.deleteObj(document.querySelector('.autocomplete-scenario'));
            }
        }
        else if(e.keyCode == 33){
            if(document.querySelector('.autocomplete-scenario')){
                currentFocusScenario = 0;
                setActiveBlock(currentFocusScenario, autocompleteListScenario);
            }
        }
        else if(e.keyCode == 34){
            if(document.querySelector('.autocomplete-scenario')){
                currentFocusScenario = autocompleteListScenario.length-1;
                setActiveBlock(currentFocusScenario, autocompleteListScenario);
            }
        }
        else if((e.ctrlKey && e.keyCode == 8) || e.keyCode == 27 || e.keyCode == 37 || e.keyCode == 39){
            if(document.querySelector('.autocomplete-scenario')){
                UIController.deleteObj(document.querySelector('.autocomplete-scenario'));
            }
        }
        else if(e.keyCode == 38){
            if(document.querySelector('.autocomplete-scenario')){
                if(currentFocusScenario == 0){
                    currentFocusScenario = autocompleteListScenario.length-1;
                    document.querySelector('.autocomplete-scenario').scrollTop = document.querySelectorAll('.autocomplete-list-scenario').length * 20;
                }
                else{
                    currentFocusScenario--;
                    document.querySelector('.autocomplete-scenario').scrollTop -= 20;
                }
                setActiveBlock(currentFocusScenario, autocompleteListScenario);
            }
        }
        else if(e.keyCode == 40){
            if(document.querySelector('.autocomplete-scenario')){
                if(currentFocusScenario == autocompleteListScenario.length-1){
                    currentFocusScenario = 0;
                    document.querySelector('.autocomplete-scenario').scrollTop = 0;
                }
                else{
                    currentFocusScenario++;
                    document.querySelector('.autocomplete-scenario').scrollTop += 20;
                }
                setActiveBlock(currentFocusScenario, autocompleteListScenario);
            }
        }
        else if(e.keyCode == 13 || e.keyCode == 9){
            if(document.querySelector('.autocomplete-scenario')){
                if(cursorPositionScenarioStart != cursorPositionScenarioEnd){
                    DOM.inputScenario.value = `${DOM.inputScenario.value.substr(0, wordBlockScenario)}${autocompleteListScenario[currentFocusScenario].getElementsByTagName("input")[0].value}${DOM.inputScenario.value.substr(cursorPositionScenarioEnd, DOM.inputScenario.value.length)}`;   
                }
                else{
                    DOM.inputScenario.value = `${DOM.inputScenario.value.substr(0, wordBlockScenario)}${autocompleteListScenario[currentFocusScenario].getElementsByTagName("input")[0].value}${DOM.inputScenario.value.substr(cursorPositionScenarioStart, DOM.inputScenario.value.length)}`;
                }
                for(var i=0; i<listStatements.length; i++){
                    var substr = new RegExp(listStatements[i], 'gi');
                    DOM.inputScenario.value=DOM.inputScenario.value.replace(substr, listStatements[i].toUpperCase());
                }
                this.selectionStart = this.selectionEnd = cursorPositionScenarioStart - (cursorPositionScenarioStart - wordBlockScenario) + autocompleteListScenario[currentFocusScenario].getElementsByTagName("input")[0].value.length;
                UIController.deleteObj(document.querySelector('.autocomplete-scenario'));
            }
        }
        else{
            wordBlockScenario = 0;
            autocompleteListScenario = null;
            
            for(var i=this.selectionStart-1; i>=0; i--){
                if(DOM.inputScenario.value[i] == ' ' || DOM.inputScenario.value[i] == '\n'){
                    wordBlockScenario = i+1;
                    break;
                }
            }
            if(document.querySelector('.autocomplete-scenario')){
                UIController.deleteObj(document.querySelector('.autocomplete-scenario'));
            }
            if(this.selectionStart-wordBlockScenario != 0){
                generateAutocomplete([listStatements], this.selectionStart, this.selectionEnd);
            }
        }

        if(document.querySelector('.autocomplete-scenario')){
            var caretPosition = Measurement.caretPos(this);
            document.querySelector('.autocomplete-scenario').style.left = `${caretPosition.left}px`;
            document.querySelector('.autocomplete-scenario').style.top = `${caretPosition.top+8}px`;
        };
    });
    
    DOM.inputScenario.addEventListener('keydown', function(e){
        if(e.keyCode == 13 || e.keyCode == 9 || e.keyCode == 38 || e.keyCode == 40){
            if(document.querySelector('.autocomplete-scenario')){
                e.preventDefault();
            }
        }
    });

    DOM.inputQuery.addEventListener('keyup', function(e){
        if((e.ctrlKey && e.keyCode == 32)){
            wordBlockQuery=0;
            autocompleteListQuery=null;
            for(var i=this.selectionStart-1; i>=0; i--){
                if(DOM.inputQuery.value[i] == ' ' || DOM.inputQuery.value[i] == '\n'){
                    wordBlockQuery=i+1;
                    break;
                }
            }
            if(document.querySelector('.autocomplete-query')){
                UIController.deleteObj(document.querySelector('.autocomplete-query'));
            }
            if(this.selectionStart-wordBlockQuery == 0){
                generateAutocomplete([listQueries, AlgorithmController.getObjects().agent, AlgorithmController.getObjects().fluent, AlgorithmController.getObjects().action, AlgorithmController.getObjects().state[0].value],this.selectionStart, this.selectionEnd, 'empty', 'shiftspace', 'query');
            }
            else{
                generateAutocomplete([listQueries, AlgorithmController.getObjects().agent, AlgorithmController.getObjects().fluent, AlgorithmController.getObjects().action, AlgorithmController.getObjects().state[0].value],this.selectionStart, this.selectionEnd, 'normal', 'shiftspace', 'query');
            }
        }
        else if(e.keyCode == 17){
            
        }
        else if(e.keyCode == 35 || e.keyCode == 36){
            if(document.querySelector('.autocomplete-query')){
                UIController.deleteObj(document.querySelector('.autocomplete-query'));
            }
        }
        else if(e.keyCode == 33){
            if(document.querySelector('.autocomplete-query')){
                currentFocusQuery = 0;
                setActiveBlock(currentFocusQuery, autocompleteListQuery);
            }
        }
        else if(e.keyCode == 34){
            if(document.querySelector('.autocomplete-query')){
                currentFocusQuery = autocompleteListQuery.length-1;
                setActiveBlock(currentFocusQuery, autocompleteListQuery);
            }
        }
        else if((e.ctrlKey && e.keyCode == 8) || e.keyCode == 27 || e.keyCode == 37 || e.keyCode == 39){
            if(document.querySelector('.autocomplete-query')){
                UIController.deleteObj(document.querySelector('.autocomplete-query'));
            }
        }
        else if(e.keyCode == 38){
            if(document.querySelector('.autocomplete-query')){
                if(currentFocusQuery == 0){
                    currentFocusQuery = autocompleteListQuery.length-1;
                    document.querySelector('.autocomplete-query').scrollTop = document.querySelectorAll('.autocomplete-list-query').length * 20;
                }
                else{
                    currentFocusQuery--;
                    document.querySelector('.autocomplete-query').scrollTop -= 20;
                }
                setActiveBlock(currentFocusQuery, autocompleteListQuery);
            }
        }
        else if(e.keyCode == 40){
            if(document.querySelector('.autocomplete-query')){
                if(currentFocusQuery == autocompleteListQuery.length-1){
                    currentFocusQuery = 0;
                    document.querySelector('.autocomplete-query').scrollTop = 0;
                }
                else{
                    currentFocusQuery++;
                    document.querySelector('.autocomplete-query').scrollTop += 20;
                }
                setActiveBlock(currentFocusQuery, autocompleteListQuery);
            }
        }
        else if(e.keyCode == 13 || e.keyCode == 9){
            if(document.querySelector('.autocomplete-query')){
                if(cursorPositionQueryStart != cursorPositionQueryEnd){
                    DOM.inputQuery.value = `${DOM.inputQuery.value.substr(0, wordBlockQuery)}${autocompleteListQuery[currentFocusQuery].getElementsByTagName("input")[0].value}${DOM.inputQuery.value.substr(cursorPositionQueryEnd, DOM.inputQuery.value.length)}`;   
                }
                else{
                    DOM.inputQuery.value = `${DOM.inputQuery.value.substr(0, wordBlockQuery)}${autocompleteListQuery[currentFocusQuery].getElementsByTagName("input")[0].value}${DOM.inputQuery.value.substr(cursorPositionQueryStart, DOM.inputQuery.value.length)}`;
                }
                for(var i=0; i<listQueries.length; i++){
                    var substr = new RegExp(listQueries[i], 'gi');
                    DOM.inputQuery.value=DOM.inputQuery.value.replace(substr, listQueries[i].toUpperCase());
                }
                this.selectionStart = this.selectionEnd = cursorPositionQueryStart - (cursorPositionQueryStart - wordBlockQuery) + autocompleteListQuery[currentFocusQuery].getElementsByTagName("input")[0].value.length;
                UIController.deleteObj(document.querySelector('.autocomplete-query'));
            }
        }
        else{
            wordBlockQuery = 0;
            autocompleteListQuery = null;
            
            for(var i=this.selectionStart-1; i>=0; i--){
                if(DOM.inputQuery.value[i] == ' ' || DOM.inputQuery.value[i] == '\n'){
                    wordBlockQuery = i+1;
                    break;
                }
            }
            if(document.querySelector('.autocomplete-query')){
                UIController.deleteObj(document.querySelector('.autocomplete-query'));
            }
            if(this.selectionStart-wordBlockQuery != 0){
                generateAutocomplete([listQueries, AlgorithmController.getObjects().agent, AlgorithmController.getObjects().fluent, AlgorithmController.getObjects().action, AlgorithmController.getObjects().state[0].value], this.selectionStart, this.selectionEnd, 'normal', 'normal', 'query');
            }
        }

        if(document.querySelector('.autocomplete-query')){
            document.querySelector('.autocomplete-query').style.bottom = `25px`;
        };
    });
    
    DOM.inputQuery.addEventListener('keydown', function(e){
        if(e.keyCode == 13 || e.keyCode == 9 || e.keyCode == 38 || e.keyCode == 40){
            if(document.querySelector('.autocomplete-query')){
                e.preventDefault();
            }
        }
    });

    DOM.btnClear.addEventListener('click', function(){
        DOM.inputScenario.value = DOM.btnClear.style.display='';
        DOM.inputScenario.focus();
    });

    DOM.btnMenu.addEventListener('click', function(){
        if(DOM.members.style.display == ''){
            DOM.members.style.width = '350px';
            DOM.members.style.display='block';
            setTimeout(function(){
                DOM.memberIcon.style.display = DOM.memberDesc.style.display='flex';
                DOM.memberList.style.display = 'block';
            }, 500);
            DOM.btnMenu.style.right = DOM.btnMenu.style.width = DOM.btnMenu.style.height='20px';
            DOM.btnMenu.style.transform = 'rotate(180deg)';
            DOM.btnMenu.style.backgroundImage = 'url("asset/ic-close.svg")';
        }
        else{
            DOM.members.style.width='0';
            setTimeout(function(){
                DOM.members.style.display = DOM.memberIcon.style.display = DOM.memberDesc.style.display = DOM.memberList.style.display = '';
            }, 500);
            DOM.btnMenu.style.right = '40px';
            DOM.btnMenu.style.transform = 'rotate(0deg)';
            DOM.btnMenu.style.width = DOM.btnMenu.style.height = '30px';
            DOM.btnMenu.style.backgroundImage = 'url("asset/ic-menu.svg")';
        };
    });

    DOM.btnHelp.addEventListener('click', function(){
        if(DOM.helpInfo.style.display == ''){
            DOM.helpInfo.style.display = 'block';
        }
        else{
            DOM.helpInfo.style.display = '';
        }
    });

    
    DOM.btnResult.addEventListener('click', function(){
        if (DOM.inputQuery.value == ''){
            UIController.displayMessage('There is no query found, please write your query', 'error');
            DOM.inputQuery.focus();
        }
        else{
            AlgorithmController.clearMessage();
            parsedQuery = AlgorithmController.parseQuery(DOM.inputQuery.value);
            console.log(parsedQuery);
            if(!AlgorithmController.getObjects().messages.length){
                DOM.resultCaption.innerHTML = AlgorithmController.calculateQuery(parsedQuery);
                DOM.btnResult.style.transform = 'rotateY(90deg)';
                setTimeout(function(){
                    DOM.btnResult.style.display = '';
                    DOM.btnBack.style.display = 'flex';
                    DOM.btnBack.style.transform = 'rotateY(0deg)';
                }, 100);
            }
            else{
                AlgorithmController.getObjects().messages.forEach(function(el){
                    UIController.displayMessage(el, 'error');
                });
                DOM.inputQuery.focus();
            }
        }
    });

    DOM.btnBack.addEventListener('click', function(){
        DOM.btnBack.style.transform = 'rotateY(90deg)';
        setTimeout(function(){
            DOM.btnBack.style.display = '';
            DOM.btnResult.style.display = 'flex';
            DOM.btnResult.style.transform = 'rotateY(0deg)';
        }, 100);
        DOM.inputQuery.focus();
    });

    DOM.btnSubmit.addEventListener('click', function(){
        if (DOM.inputScenario.value == ''){
            UIController.displayMessage(`There is no scenario found, please write your scenario`, 'error');
            DOM.inputScenario.focus();
        }
        else{
            AlgorithmController.emptyList();
            console.clear();
            DOM.inputScenario.value.split('\n').forEach(function(e){
                AlgorithmController.parseScenario(e);
            });
            if(!AlgorithmController.getObjects().action.length){
                AlgorithmController.setMessage('The scenario you entered is incorrect. Please write the correct one');
            }
            if(!AlgorithmController.getObjects().messages.length){
                var initialStates = [], initialState = null;
                DOM.inputScenario.value.split('\n').forEach(function(el){
                    if(el.toUpperCase().includes("INITIALLY")){
                        initialStates.push(el);
                    }
                });
                if(initialStates.length){
                    initialStates.forEach(function(el){
                        initialState = AlgorithmController.genInitialState(el);
                    });
                }
                else{
                    initialState = AlgorithmController.genInitialState(null);
                }
                if(initialState.length){
                    DOM.resultCanvas.style.display = 'block';
                    DOM.resultCanvas.style.backgroundColor = 'rgba(96, 96, 96, 0.2)';
                    AlgorithmController.generateStates(AlgorithmController.getObjects().fluent, initialState);
                    AlgorithmController.calculateScenario();
                    initialState.forEach(function(el, idx){
                        var calculations = [];
                        calculations.push(`Model ${idx+1}`);
                        calculations.push(...AlgorithmController.setListCalculations(AlgorithmController.getObjects().state[idx].value, 'curly'));
                        calculations.push(...AlgorithmController.setListCalculations(AlgorithmController.getObjects().res0Calc[idx].value, 'curly', 'Res0'));
                        calculations.push(...AlgorithmController.setListCalculations(AlgorithmController.getObjects().newCalc[idx].value, 'curly', 'New', true));
                        calculations.push(...AlgorithmController.setListCalculations(AlgorithmController.getObjects().resCalc[idx].value, 'curly', 'Res'));
                        AlgorithmController.setDisplayCalc(calculations);
                    });
                    console.log('Messages ', AlgorithmController.getObjects().messages);
                    console.log('Actions ', AlgorithmController.getObjects().action);
                    console.log('Agents ', AlgorithmController.getObjects().agent);
                    console.log('Fluent ', AlgorithmController.getObjects().fluent);
                    console.log('States ', AlgorithmController.getObjects().state);
                    console.log('Res0 ', AlgorithmController.getObjects().res0Calc);
                    console.log('New ', AlgorithmController.getObjects().newCalc);
                    console.log('Res ', AlgorithmController.getObjects().resCalc);
                    console.log('Display ', AlgorithmController.getObjects().displayCalc);
                    console.log('Calc ', AlgorithmController.getStatements());
                    DOM.resultContent.style.display = 'block';
                    DOM.resultContent.style.height = '220px';
                    setTimeout(function(){
                        DOM.resultContent.style.overflow = 'hidden';
                        DOM.listWrapper.forEach(function(e){
                            e.style.display = 'flex';
                        })
                        DOM.btnClose.style.display = DOM.queryDesc.style.display = DOM.queryWrapper.style.display = 'block';
                        DOM.btnResult.style.display = 'flex';
                        DOM.inputQuery.focus();
                        setTimeout(function(){
                            DOM.resultContent.style.overflow = '';
                        },1000);
                    },250);

                }
                else{
                    UIController.displayMessage('The initial state againts the constraint statement', 'error');
                }
            }
            else{
                AlgorithmController.getObjects().messages.forEach(function(el){
                    UIController.displayMessage(el, 'error');
                });
                DOM.inputScenario.focus();
            }
        }
    });

    DOM.btnClose.addEventListener('click', function(){
        DOM.listWrapper.forEach(function(e){
            e.style.display='';
        })
        DOM.btnClose.style.display = DOM.queryDesc.style.display = DOM.queryWrapper.style.display = DOM.btnResult.style.display = DOM.helpInfo.style.display = DOM.listInfo.style.display = DOM.listInfoBefore.style.display = DOM.btnBack.style.display = DOM.inputQuery.value ='';
        DOM.resultContent.style.height = '0';
        DOM.resultCanvas.style.backgroundColor = 'rgba(96, 96, 96, 0)';
        DOM.btnBack.style.transform = 'rotateY(90deg)';
        DOM.btnResult.style.transform = 'rotateY(0deg)';

        setTimeout(function(){
            DOM.resultCanvas.style.display = DOM.resultContent.style.display = '';
        },250);
    });

    DOM.fileScenario.addEventListener('change', function(e){
        for (var i=0; i<e.target.files.length; i++){
            if(e.target.files[i].name){
                var fr = new FileReader();
                fr.onload = function(){
                    var datafiles = this.result;
                    for(var j=0; j<listStatements.length; j++){
                        var substr = new RegExp(listStatements[j], 'gi');
                        datafiles=datafiles.replace(substr, listStatements[j].toUpperCase());
                    }
                    DOM.inputScenario.value = datafiles;
                    DOM.inputScenario.focus();
                    if (DOM.inputScenario.value.length){
                        if (DOM.btnClear.style.display == ''){
                            DOM.btnClear.style.display = 'block';
                        }
                    }else{
                        if (DOM.btnClear.style.display == 'block'){
                            DOM.btnClear.style.display = '';
                        }
                    }
                }
                fr.readAsText(e.target.files[i]);
            }
        }
    });
    
    DOM.btnSave.addEventListener('click', function(){
        if (DOM.inputScenario.value == ''){
            UIController.displayMessage(`There is no scenario to save, please write your scenario`, 'error');
        }
        else{
            var newLine = new RegExp('\n', 'gi');
            var normalizeInput = DOM.inputScenario.value.replace(newLine, '\r\n');
            saveTextAsFile(normalizeInput);
        }
    });

    var selectList = function(e, input = 'scenario'){
        if (input == 'scenario'){
            if(cursorPositionScenarioStart != cursorPositionScenarioEnd){  
                DOM.inputScenario.value = `${DOM.inputScenario.value.substr(0, wordBlockScenario)}${e.getElementsByTagName("input")[0].value}${DOM.inputScenario.value.substr(cursorPositionScenarioEnd, DOM.inputScenario.value.length)}`; 
            }
            else{
                DOM.inputScenario.value = `${DOM.inputScenario.value.substr(0, wordBlockScenario)}${e.getElementsByTagName("input")[0].value}${DOM.inputScenario.value.substr(cursorPositionScenarioStart, DOM.inputScenario.value.length)}`;
            }
            for(var i=0; i<listStatements.length; i++){
                var substr = new RegExp(listStatements[i], 'gi');
                DOM.inputScenario.value=DOM.inputScenario.value.replace(substr, listStatements[i].toUpperCase());
            }
            DOM.inputScenario.focus();
            DOM.inputScenario.selectionStart = DOM.inputScenario.selectionEnd = cursorPositionScenarioStart - (cursorPositionScenarioStart - wordBlockScenario) + e.getElementsByTagName("input")[0].value.length;
            UIController.deleteObj(document.querySelector('.autocomplete-scenario'));
        }
        else{
            if(cursorPositionQueryStart != cursorPositionQueryEnd){
                DOM.inputQuery.value = `${DOM.inputQuery.value.substr(0, wordBlockQuery)}${e.getElementsByTagName("input")[0].value}${DOM.inputQuery.value.substr(cursorPositionQueryEnd, DOM.inputQuery.value.length)}`;   
            }
            else{
                DOM.inputQuery.value = `${DOM.inputQuery.value.substr(0, wordBlockQuery)}${e.getElementsByTagName("input")[0].value}${DOM.inputQuery.value.substr(cursorPositionQueryStart, DOM.inputQuery.value.length)}`;
            }
            for(var i=0; i<listQueries.length; i++){
                var substr = new RegExp(listQueries[i], 'gi');
                DOM.inputQuery.value=DOM.inputQuery.value.replace(substr, listQueries[i].toUpperCase());
            }
            DOM.inputQuery.focus();
            DOM.inputQuery.selectionStart = DOM.inputQuery.selectionEnd = cursorPositionQueryStart - (cursorPositionQueryStart - wordBlockQuery) + e.getElementsByTagName("input")[0].value.length;
            UIController.deleteObj(document.querySelector('.autocomplete-query'));
        }
    }

    document.addEventListener('click', function(e){
        if (e.target.classList[0] == 'autocomplete-list-scenario'){
            selectList(e.target);
        }
        else if (e.target.parentElement.classList[0] == 'autocomplete-list-scenario'){
            selectList(e.target.parentElement);
        }
        else if (e.target.classList[0] == 'autocomplete-list-query'){
            selectList(e.target, 'query');
        }
        else if (e.target.parentElement.classList[0] == 'autocomplete-list-query'){
            selectList(e.target.parentElement, 'query');
        }
        else{
            if(document.querySelector('.autocomplete-scenario')){
                UIController.deleteObj(document.querySelector('.autocomplete-scenario'));
            }
            if(document.querySelector('.autocomplete-query')){
                UIController.deleteObj(document.querySelector('.autocomplete-query'));
            }
        };
    });

    DOM.btnAgents.addEventListener('click', function(){
        if(document.querySelector('.listinfo-list')){
            UIController.deleteObj(document.querySelector('.listinfo-list'));
        }
        if(document.querySelector('.model-wrapper')){
            UIController.deleteObj(document.querySelector('.model-wrapper'));
        }
        if (DOM.listInfo.style.left == '30px'){
            if(DOM.listInfo.style.display == ''){
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = 'block';
                generateList(AlgorithmController.getObjects().agent, false);
            }
            else{
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = '';
            }
        }
        else{
            DOM.listInfo.style.left = '30px';
            DOM.listInfoBefore.style.left = '35px';
            DOM.listInfoDesc.textContent = 'List of Agents';
            if(DOM.listInfo.style.display == ''){
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = 'block';
            }
            generateList(AlgorithmController.getObjects().agent, false);
        }
    });

    DOM.btnFluents.addEventListener('click', function(){
        if(document.querySelector('.listinfo-list')){
            UIController.deleteObj(document.querySelector('.listinfo-list'));
        }
        if(document.querySelector('.model-wrapper')){
            UIController.deleteObj(document.querySelector('.model-wrapper'));
        }
        if (DOM.listInfo.style.left == '240px'){
            if(DOM.listInfo.style.display == ''){
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = 'block';
                generateList(AlgorithmController.getObjects().fluent, false);
            }
            else{
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = '';
            }
        }
        else{
            DOM.listInfo.style.left = '240px';
            DOM.listInfoBefore.style.left = '245px';
            DOM.listInfoDesc.textContent = 'List of Fluents';
            if(DOM.listInfo.style.display == ''){
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = 'block';
            }
            generateList(AlgorithmController.getObjects().fluent, false);
        }
    });

    DOM.btnActions.addEventListener('click', function(){
        if(document.querySelector('.listinfo-list')){
            UIController.deleteObj(document.querySelector('.listinfo-list'));
        }
        if(document.querySelector('.model-wrapper')){
            UIController.deleteObj(document.querySelector('.model-wrapper'));
        }
        if (DOM.listInfo.style.left == '450px'){
            if(DOM.listInfo.style.display == ''){
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = 'block';
                generateList(AlgorithmController.getObjects().action, false);
            }
            else{
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = '';
            }
        }
        else{
            DOM.listInfo.style.left = '450px';
            DOM.listInfoBefore.style.left = '455px';
            DOM.listInfoDesc.textContent = 'List of Actions';
            if(DOM.listInfo.style.display == ''){
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = 'block';
            }
            generateList(AlgorithmController.getObjects().action, false);
        }
    });

    DOM.btnCalculations.addEventListener('click', function(){
        if(document.querySelector('.model-wrapper')){
            UIController.deleteObj(document.querySelector('.model-wrapper'));
        }
        if(document.querySelector('.listinfo-list')){
            UIController.deleteObj(document.querySelector('.listinfo-list'));
        }
        if (DOM.listInfo.style.left == '660px'){
            if(DOM.listInfo.style.display == ''){
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = 'block';
                generateList(AlgorithmController.getObjects().displayCalc, true);
            }
            else{
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = '';
            }
        }
        else{
            DOM.listInfo.style.left = '660px';
            DOM.listInfoBefore.style.left = '665px';
            DOM.listInfoDesc.textContent = 'List of Calculations';
            if(DOM.listInfo.style.display == ''){
                DOM.listInfo.style.display = DOM.listInfoBefore.style.display = 'block';
            }
            generateList(AlgorithmController.getObjects().displayCalc, true);
        }
    });

})(UIController, AlgorithmController);