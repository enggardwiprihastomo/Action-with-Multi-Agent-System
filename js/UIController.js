var UIController = (function(){
    var DOM = {
        body: document.querySelector('body'),
        btnStart: document.querySelector('.btn-start'),
        btnClear: document.querySelector('.btn-clear'),
        btnMenu: document.querySelector('.btn-menu'),
        btnResult: document.querySelector('.btn-result'),
        btnBack: document.querySelector('.btn-back'),
        btnHelp: document.querySelector('.btn-help-query'),
        btnMenu: document.querySelector('.btn-menu'),
        btnSubmit: document.querySelector('.btn-submit'),
        btnClose: document.querySelector('.btn-close'),
        btnSave: document.querySelector('.btn-save'),
        fileScenario: document.querySelector('.file-scenario'),
        helpInfo: document.querySelector('.help-info'),
        content: document.querySelector('.content-wrapper'),
        contentTitle: document.querySelector('.content-title'),
        inputWrapper: document.querySelector('.input-wrapper'),
        inputScenario: document.querySelector('.input-scenario'),
        inputQuery: document.querySelector('.input-query'),
        members: document.querySelector('.members'),
        memberIcon: document.querySelector('.members-icon'),
        memberDesc: document.querySelector('.members-desc'),
        memberList: document.querySelector('.members-list'),
        resultCanvas: document.querySelector('.result-canvas'),
        resultContent: document.querySelector('.result-content'),
        queryDesc: document.querySelector('.query'),
        queryWrapper: document.querySelector('.query-wrapper'),
        listWrapper: document.querySelectorAll('.list-wrapper'),
        messageSection: document.querySelector('.message-wrapper'),
        listInfo: document.querySelector('.listinfo'),
        listInfoBefore: document.querySelector('.listinfo-before'),
        listInfoDesc: document.querySelector('.listinfo-desc'),
        listInfoList: document.querySelector('.listinfo-list'),
        btnAgents: document.querySelector('.agents'),
        btnFluents: document.querySelector('.fluents'),
        btnActions: document.querySelector('.actions'),
        btnCalculations: document.querySelector('.calculations'),
        resultCaption: document.querySelector('.result-capt')
    };

    var deleteMessage = function(){
        setTimeout(function(){
            document.querySelector('.message').style.transform = 'translateX(-50px) scale(1.5)';
            document.querySelector('.message').style.opacity = 0;
            setTimeout(function(){
                document.querySelector(".message").parentElement.removeChild(document.querySelector(".message"));
            },250);
        }, 5000);
    };

    return {
        DOM: DOM,
        deleteObj: function(obj){
            obj.parentNode.removeChild(obj);
        },
        deleteMultipleObj: function(obj){
            obj.forEach(function(el){
                el.parentNode.removeChild(el);
            });
        },
        insertObj: function(parent, obj, state = 'beforeend'){
            parent.insertAdjacentHTML(state, obj);
        },
        displayMessage: function(message, status = 'normal'){
            var Id = Math.floor(Math.random() * 1000);
            DOM.messageSection.insertAdjacentHTML('beforeend', "<div class='message' id='message-" + Id + "'>" + message + "</div>");
            if(status == 'error'){
                document.querySelector("#message-" + Id).style.background = "#C44444";
            }
            else if(status == 'warning'){
                document.querySelector("#message-" + Id).style.background = "#FFD000";
            }
            deleteMessage();
        },
    }
})();