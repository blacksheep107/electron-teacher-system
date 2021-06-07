var globalData=require('./globalData');
var ACCESS_TOKEN;
var classinfo;
var forcedclass;
function getClassInfo(classid){
    // 清空
    let cleardoc=document.querySelector('.class-section > div');
    while(cleardoc){
        cleardoc.remove();
        cleardoc=document.querySelector('.class-section > div');
    }
    const http=new XMLHttpRequest();
    const APPID='wx53d4c253e80f5250';
    const APPSECRET='99bfb8dd8bf3736bf4cd0103722b8fbc';
    http.open("GET",`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`);
    http.send();
    http.onreadystatechange=e=>{
        if(http.readyState==4){
            ACCESS_TOKEN=JSON.parse(http.responseText).access_token;
            var ht=new XMLHttpRequest();
            ht.open('POST',`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,true);
            let data={
                "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                "query":`db.collection(\'class\').where({classid:'${classid}'}).limit(100).get()`
            }
            ht.send(JSON.stringify(data));
            ht.onreadystatechange=e=>{
                if(ht.readyState==4){
                    // console.log(JSON.parse(JSON.parse(ht.responseText).data));
                    let info=JSON.parse(JSON.parse(ht.responseText).data);
                    console.log(info);
                    forcedclass=info;
                    // console.log(info.homework);
                    document.querySelector('.class-manage-section').classList.remove('is-shown');
                    let doc=document.querySelector('.class-section');
                    doc.classList.add('is-shown');
                    let classnode=document.createElement('div');
                    classnode.innerHTML=`<div class="classid">班级编号：${info.classid}</div><div class="classname">班级名：${info.classname}</div>`
                    classnode.classList.add('classinfo');
                    doc.appendChild(classnode);
                    let line=document.createElement('div');
                    line.classList.add('line');
                    doc.appendChild(line);
                    let stuarray=[];
                    new Promise((resolve,reject)=>{
                        for(let i=0;i<info.students.length;i++){
                            // 数据处理
                            // let a=getStudentInfo(info.students[i]);
                            // console.log(a);
                            // stuarray.push(a);
                            // console.log(stuarray);
                            const stuhttp=new XMLHttpRequest();
                            stuhttp.open('POST',`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,true);
                            let data={
                                "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                                "query":`db.collection(\'users\').where({studentid:'${info.students[i]}'}).limit(100).get()`
                            }
                            stuhttp.send(JSON.stringify(data));
                            stuhttp.onreadystatechange=e=>{
                                if(stuhttp.readyState==4){
                                    let stinfo=JSON.parse(JSON.parse(stuhttp.responseText).data[0]);
                                    stuarray.push(stinfo);
                                    if(i==info.students.length-1){
                                        resolve();
                                    }                                    
                                }
                            }
                        }
                    }).then(()=>{
                        stuarray.sort(function(a,b){
                            return a.studentid<b.studentid;
                        });
                        let studentinfo=document.createElement('div');
                        studentinfo.classList.add('studentinfo');
                        console.log(stuarray);
                        for(let i=0;i<stuarray.length;i++){
                            let newnode=document.createElement('div');
                            newnode.classList.add('onestudent');
                            newnode.innerHTML= `<p>${stuarray[i].studentid}</p><p>${stuarray[i].name}</p><p>已完成题目数：</p><p>${stuarray[i].answeredquestions.length}</p>`;
                            studentinfo.appendChild(newnode);
                            console.log(newnode);
                        }
                        doc.appendChild(studentinfo);                        
                    })
                }
            }
        }
    }
}
function getStudentInfo(id){
    const stuhttp=new XMLHttpRequest();
    stuhttp.open('POST',`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,true);
    let data={
        "env":"fzuanswersystem-7g3gmzjw761ecfdb",
        "query":`db.collection(\'users\').where({studentid:'${id}'}).limit(100).get()`
    }
    stuhttp.send(JSON.stringify(data));
    stuhttp.onreadystatechange=e=>{
        if(stuhttp.readyState==4){
            let info=JSON.parse(JSON.parse(stuhttp.responseText).data[0]);
            console.log(info);
            return info;
        }
    }
}
function addClass(){
    let newblock=document.querySelector('.addclass');
    newblock.classList.remove('is-hidden');
    while(newblock.hasChildNodes()) newblock.removeChild(newblock.firstChild);
    let newid=document.createElement('div');
    let attr=document.createAttribute('class');
    attr.value='ainput';
    newid.setAttributeNode(attr);
    newid.innerHTML='<label for=\'newclassid\'>新班级编号：</label><input id=\'newclassid\'>';
    let newname=document.createElement('div');
    let attr2=document.createAttribute('class');
    attr2.value='ainput';
    newname.setAttributeNode(attr2);
    newname.innerHTML='<label for=\'newclassname\'>新班级名字：</label><input id=\'newclassname\'>';
    let newbtn=document.createElement('div');
    newbtn.innerHTML='<button class="addbtn" onclick=addClassAction()>添加</button>'
    const doc=document.querySelector('.class-section');
    newblock.prepend(newbtn);
    newblock.prepend(newname);
    newblock.prepend(newid);
}
function addClassAction(){
    let newid=document.getElementById('newclassid').value;
    let newname=document.getElementById('newclassname').value;
    // add record in class
    if(!ACCESS_TOKEN){
        const http=new XMLHttpRequest();
        const APPID='wx53d4c253e80f5250';
        const APPSECRET='99bfb8dd8bf3736bf4cd0103722b8fbc';
        http.open("GET",`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`);
        http.send();
        http.onreadystatechange=e=>{
            if(http.readyState==4){
                ACCESS_TOKEN=JSON.parse(http.responseText).access_token;
                const addhttp=new XMLHttpRequest();
                addhttp.open('POST',`https://api.weixin.qq.com/tcb/databaseadd?access_token=${ACCESS_TOKEN}`);
                let data={
                    "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                    "query":`db.collection(\"class\").add({data:${JSON.stringify({
                        classid:newid,
                        classname:newname,
                        teacherid:globalData.teacherid,
                        questions:[],
                        students:[],
                        homeword:{},
                    })}})`
                }
                addhttp.send(JSON.stringify(data));
                new Promise(resolve=>{
                    addhttp.onreadystatechange=e=>{
                        console.log(addhttp.responseText);
                        if(addhttp.readyState==4){
                            let res=addhttp.responseText;
                            if(JSON.parse(res).errcode==0){
                                // add ok
                                resolve();
                            }
                        }
                    }        
                }).then(()=>{
                    const updatehttp=new XMLHttpRequest();
                    updatehttp.open('POST',`https://api.weixin.qq.com/tcb/databaseupdate?access_token=${ACCESS_TOKEN}`);
                    let newdata={
                        "classid":newid,
                        "classname":newname
                    }
                    data={
                        "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                        "query":`db.collection(\"teacher\").where({id:'${globalData.teacherid}'}).update({data:{class: db.command.push(${JSON.stringify(newdata)})}})`
                    }
                    updatehttp.send(JSON.stringify(data));
                    updatehttp.onreadystatechange=e=>{
                        if(updatehttp.readyState==4){
                            let res=JSON.parse(updatehttp.responseText);
                            console.log(res);
                            if(res.errcode==0&&res.modified>0){
                                // 添加成功
                                document.querySelector('.addclass').classList.add('is-hidden');
                                let classlist=document.querySelector('.class-list');
                                let newclassdiv=document.createElement('div');
                                newclassdiv.innerHTML=`<button class="classBlock" onclick="getClassInfo(${newid})">${newname}</button>`
                                classlist.appendChild(newclassdiv);
                                globalData.teacherclass.push({
                                    'classid':newid,
                                    'classname':newname
                                });
                                showAnime('添加成功！');
                            }
                        }
                    }
                })
            }
        }
    }else{
        const addhttp=new XMLHttpRequest();
        addhttp.open('POST',`https://api.weixin.qq.com/tcb/databaseadd?access_token=${ACCESS_TOKEN}`);
        let data={
            "env":"fzuanswersystem-7g3gmzjw761ecfdb",
            "query":`db.collection(\"class\").add({data:${JSON.stringify({
                classid:newid,
                classname:newname,
                teacherid:globalData.teacherid,
                questions:[],
                students:[]
            })}})`
        }
        addhttp.send(JSON.stringify(data));
        new Promise(resolve=>{
            addhttp.onreadystatechange=e=>{
                console.log(addhttp.responseText);
                if(addhttp.readyState==4){
                    let res=addhttp.responseText;
                    if(JSON.parse(res).errcode==0){
                        // add ok
                        resolve();
                    }
                }
            }        
        }).then(()=>{
            const updatehttp=new XMLHttpRequest();
            updatehttp.open('POST',`https://api.weixin.qq.com/tcb/databaseupdate?access_token=${ACCESS_TOKEN}`);
            let newdata={
                "classid":newid,
                "classname":newname
            }
            data={
                "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                "query":`db.collection(\"teacher\").where({id:'${globalData.teacherid}'}).update({data:{class: db.command.push(${JSON.stringify(newdata)})}})`
            }
            updatehttp.send(JSON.stringify(data));
            updatehttp.onreadystatechange=e=>{
                if(updatehttp.readyState==4){
                    let res=JSON.parse(updatehttp.responseText);
                    console.log(res);
                    if(res.errcode==0&&res.modified>0){
                        // 添加成功
                        document.querySelector('.addclass').classList.add('is-hidden');
                        let classlist=document.querySelector('.class-list');
                        let newclassdiv=document.createElement('div');
                        newclassdiv.innerHTML=`<button class="classBlock" onclick="getClassInfo(${newid})">${newname}</button>`
                        classlist.appendChild(newclassdiv);
                        globalData.teacherclass.push({
                            'classid':newid,
                            'classname':newname
                        });
                        showAnime('添加成功！');
                    }
                }
            }
        })
    }

}
// function showAnime(text){
//     let doc=document.querySelector('.content');
//     let block=document.createElement('div');
//     block.innerHTML=`<div class="tip">${text}</div>`;
//     doc.appendChild(block);
//     // setTimeout(function(){
//     //     doc.removeChild(block);
//     // },3000);
// }
function jmpToQuestion(){
    // 跳转查看题目页面
    hideAllSectionsAndDeselectButtons();
    document.querySelector('.question-section').classList.add('is-shown');
    // 传值
    document.getElementById('question_title').innerHTML=document.querySelector('.classname').innerHTML;
    loadUnitQuestions();
}
function loadUnitQuestions(){
    // 显示几个单元
    removeAllHomework();
    getAccess().then(()=>{
        const getht=new XMLHttpRequest();
        let classid=document.querySelector('.classid').innerHTML.substring(5);
        getht.open('POST',`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,true);
        let data={
            "env":"fzuanswersystem-7g3gmzjw761ecfdb",
            "query":`db.collection(\'class\').where({classid:'${classid}'}).limit(100).get()`
        }
        getht.send(JSON.stringify(data));
        getht.onreadystatechange=e=>{
            if(getht.readyState==4){
                let info=JSON.parse(JSON.parse(getht.responseText).data).homework;
                // console.log(info);
                classinfo=info;
                let allUnits=document.querySelector('.allUnits');
                allUnits.innerHTML="";
                Object.keys(info).forEach(function(i){
                    let newnode=document.createElement('div');
                    newnode.classList.add('a-homework');
                    let id=document.createAttribute('id');
                    id.value=i;
                    newnode.setAttributeNode(id);
                    newnode.innerHTML=`<div class="homework-title"><h3 class="showQuestions" onclick="showQuestions('${i}','${info[i]}')">${i}</h3><button class="addhomework-btn" onclick="addHomework('${i}')">添加作业</button></div>`;
                    allUnits.appendChild(newnode);
                })
            }
        }
    })
}
function removeAllHomework(){
    let allUnits=document.querySelector('.allUnits');
    while(allUnits.hasChildNodes()) allUnits.removeChild(allUnits.firstChild);
}
function showQuestions(key,homework){
    // ${}占位符会把数组转成字符串
    hideAllHomework();
    let arr=homework.split(',');
    let div=document.getElementById(key);
    for(let j=0;j<arr.length;j++){
        let qnode=document.createElement('div');    // 该单元所有作业
        getQuestion(arr[j]).then(res=>{
            res=JSON.parse(res);
            console.log(res);
            let type=(res.type=='fillblack'?'填空题':'单选题');
            if(res.choosenum>1) type='多选题';
            let levelobj={
                'easy':'易',
                'medium':'中',
                'hard':'难'
            };
            // qnode.classList.add('workdata-parent');
            qnode.innerHTML=`<div class="workdata" onclick="showStudentWork('${res._id}')">
                <div class="workdata-title">
                    <p>${type}</p>
                    <p>${levelobj[res.level]}</p>                
                </div>
                <div class="workdata-content">
                    <p>问题：${res.content}</p>
                    <p>答案：${res.answer}</p>
                    <p>解析：${res.analysis}</p>
                </div>
            </div>`

            let block=document.createElement('div');
            block.classList.add('studentdid');
            block.id=res._id;
            block.innerHTML='';
            for(let i=0;i<res.studentsdid.length;i++){
                block.innerHTML+=`<div class="a-studentdid">
                    <p>${res.studentsdid[i].studentid}</p>
                    <p>${res.studentsdid[i].studentname}</p>
                    <p>${res.studentsdid[i].isRight}</p>
                </div>`
            }
            qnode.appendChild(block);
            div.append(qnode);
        });
    }
}
function showStudentWork(id){
    // 做过题的学生
    let node=document.getElementById(id);
    if(node.classList.contains('is-shown')){
        node.classList.remove('is-shown');
    }else{
        node.classList.add('is-shown');
    }
}
function hideAllHomework(){
    let allwork=document.querySelectorAll('.a-homework');
    for(let i=0;i<allwork.length;i++){
        while(allwork[i].childNodes.length>1) allwork[i].removeChild(allwork[i].lastChild);
    }
}
function backClass(){
    document.querySelector('.question-manage-section').classList.remove('is-shown');
    document.querySelector('.question-section').classList.add('is-shown');
}
function addHomework(key){
    console.log(key);
    document.querySelector('.question-manage-section').classList.add('is-shown');
    document.querySelector('.question-section').classList.remove('is-shown');
    onLoad(key);
}
function addUnit(){
    // 添加章节
    let newnode=document.createElement('div');
    newnode.innerHTML=`<input placeholder="输入新章节名称" id="newunitname">`;
    let addbtn=document.querySelector('.addUnit');
    let doc=document.querySelector('.question-section');
    doc.insertBefore(newnode,addbtn.nextSibling);
    let newbtn=document.createElement('button');
    newbtn.innerHTML='添加';
    let click=document.createAttribute('onclick');
    click.value=`addUnitAction()`;
    newbtn.setAttributeNode(click);
    newnode.appendChild(newbtn);
}
function addUnitAction(){
    let newunitname=document.getElementById('newunitname').value;
    const http=new XMLHttpRequest();
    http.open('POST',`https://api.weixin.qq.com/tcb/databaseupdate?access_token=${ACCESS_TOKEN}`);
    let classid=document.querySelector('.classid').innerHTML.substring(5);
    let newdata=classinfo;
    newdata[newunitname]=[];
    // console.log(newdata);
    // 对象不能用push更新
    console.log(newdata);
    let data={
        "env":"fzuanswersystem-7g3gmzjw761ecfdb",
        "query":`db.collection(\"class\").where({classid:'${classid}'}).update({data:{homework:${JSON.stringify(newdata)}}})`
    }
    http.send(JSON.stringify(data));
    http.onreadystatechange=e=>{
        if(http.readyState==4){
            let res=JSON.parse(http.responseText);
            console.log(res);
            if(res.errcode==0&&res.modified==1){
                showAnime('添加新章节成功！');
                forcedclass.homework[newunitname]=[];
                document.getElementById('newunitname').value="";
                loadUnitQuestions();
            }
        }
    }
}
function getQuestion(id){
    return new Promise(resolve=>{
        const getht=new XMLHttpRequest();
        getht.open('POST',`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,true);
        let data={
            "env":"fzuanswersystem-7g3gmzjw761ecfdb",
            "query":`db.collection(\'questions\').doc('${id}').get()`
        }
        getht.send(JSON.stringify(data));
        getht.onreadystatechange=e=>{
            if(getht.readyState==4){
                let ques=JSON.parse(getht.responseText);
                if(ques.errcode==0&&ques.data.length==1){
                    // 找到
                    resolve(ques.data[0]);
                }
            }
        }
    })
}
function hideAllSectionsAndDeselectButtons () {
    const sections = document.querySelectorAll('.js-section.is-shown')
    Array.prototype.forEach.call(sections, (section) => {
        section.classList.remove('is-shown')
    })

    const buttons = document.querySelectorAll('.nav-button.is-selected')
    Array.prototype.forEach.call(buttons, (button) => {
        button.classList.remove('is-selected')
    })
}
var onunit;
function onLoad(key){
    onunit=key;
    var doc=document.querySelector('.form');
    var selectblock=document.querySelector('.selectblock');
    // 班级 章节信息
    if(!document.querySelector('.add-question-title')){
        let classinfoNode=document.createElement('div');
        classinfoNode.classList.add('add-question-title');
        classinfoNode.innerHTML=`<p id="classname-select">${forcedclass.classname}</p><p id="unitname">${key}</p>`
        doc.prepend(classinfoNode);
    }else{
        document.getElementById('unitname').innerHTML=key;
    }

    // 添加下拉框
    if(!document.querySelector('select')){
        let selectType=document.createElement('select');
        let typeattr=document.createAttribute('id');
        typeattr.value='selectType';
        selectType.setAttributeNode(typeattr);
        selectType.innerHTML='';
        for(let i=0;i<typearr.length;i++){
            selectType.innerHTML+=`<option>${typearr[i]}</option>`;
        }
        let selectLevel=document.createElement('select');
        let attr2=document.createAttribute('id');
        attr2.value='selectLevel';
        selectLevel.setAttributeNode(attr2);
        selectLevel.innerHTML='';
        for(let i=0;i<hardlevel.length;i++){
            selectLevel.innerHTML+=`<option>${hardlevel[i]}</option>`;
        }
        selectblock.prepend(selectType);
        selectblock.prepend(selectLevel);        
    }

    hideAllForm();
    document.querySelector('.selectSingle').classList.add('is-shown');
    document.getElementById('selectType').addEventListener('change',function(e){
        console.log(e.target.value);
        if(e.target.value=='单选题'){
            document.querySelector('.selectSingle').classList.add('is-shown');
            document.querySelector('.selectMore').classList.remove('is-shown');
            document.querySelector('.fillblank').classList.remove('is-shown');
        }else if(e.target.value=='多选题'){
            document.querySelector('.selectSingle').classList.remove('is-shown');
            document.querySelector('.selectMore').classList.add('is-shown');
            document.querySelector('.fillblank').classList.remove('is-shown');
        }else if(e.target.value=='填空题'){
            document.querySelector('.selectSingle').classList.remove('is-shown');
            document.querySelector('.selectMore').classList.remove('is-shown');
            document.querySelector('.fillblank').classList.add('is-shown');
        }
    });
}
function submit(){
    console.log(forcedclass.homework);
    submitQuestion(forcedclass.homework[onunit]);
}