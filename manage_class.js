var globalData=require('./globalData');
var ACCESS_TOKEN;
var classinfo;
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
function showAnime(text){
    let doc=document.querySelector('.content');
    let block=document.createElement('div');
    block.innerHTML=`<div class="tip">${text}</div>`;
    doc.appendChild(block);
    setTimeout(function(){
        doc.removeChild(block);
    },3000);
}
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
    // console.log(globalData);
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
                console.log(info);
                classinfo=info;
                let allUnits=document.querySelector('.allUnits');
                Object.keys(info).forEach(function(i){
                    let newnode=document.createElement('div');
                    newnode.classList.add('a-homework');
                    let attr=document.createAttribute('onclick');
                    attr.value=`showQuestions('${i}','${info[i]}')`;
                    let id=document.createAttribute('id');
                    id.value=i;
                    newnode.setAttributeNode(attr);
                    newnode.setAttributeNode(id);
                    newnode.innerHTML=`<h3>${i}</h3><button onclick="addHomework(${i})">添加作业</button>`;
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
    // 显示这个单元的所有题目，添加作业
    // toggle
    // ${}占位符会把数组转成字符串
    let arr=homework.split(',');
    console.log(arr);
    let div=document.getElementById(key);
    for(let j=0;j<arr.length;j++){
        let qnode=document.createElement('div');    // 该单元所有作业
        getQuestion(arr[j]).then(res=>{
            console.log(res);
            qnode.innerHTML=`<div class="workdata"><p>${res}</p></div>`
        })
    }
}
function addHomework(key){
    console.log(key);
    
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
            console.log(http.responseText);
        }
    }
}
function getQuestion(id){
    return new Promise(resolve=>{
        console.log(id);
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
                // 找不到是因为添加题目的时候没更新homework字段，记得改
                if(ques.errcode==0&&ques.data.length==1){
                    // 找到
                    console.log(ques.data);
                    resolve(ques.data);
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