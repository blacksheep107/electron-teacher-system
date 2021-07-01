var globalData=require('./globalData');
var ACCESS_TOKEN;
var classinfo;
var forcedclass;
function getClassInfo(classid){
    // 清空
    console.log(classid);   // 有前导0的纯数字会出错
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
                    let info=JSON.parse(JSON.parse(ht.responseText).data);
                    console.log(info);
                    let sttitle=document.createElement('div');
                    sttitle.classList.add('sttitle');
                    sttitle.innerHTML=`<p class=pwidth>学号</p>
                    <p class=pwidth>姓名</p>`;
                    let unitObj={};
                    new Promise(re=>{
                        let count=Object.keys(info.homework).length;
                        Object.keys(info.homework).forEach(unit=>{
                            // 每个单元
                            unitObj[unit]=0;
                            let unitc=info.homework[unit].questions.length;
                            let unitscore=0;
                            new Promise(resolve=>{
                                if(info.homework[unit].questions.length==0) resolve();
                                info.homework[unit].questions.forEach(q=>{
                                    let h=new XMLHttpRequest();
                                    h.open("POST",`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`);
                                    let data={
                                        "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                                        "query":`db.collection(\'questions\').doc('${q}').get()`
                                    };
                                    h.send(JSON.stringify(data));
                                    h.onreadystatechange=e=>{
                                        if(h.readyState==4){
                                            let res=JSON.parse(h.responseText);
                                            if(res.data.length>0){
                                                let d=JSON.parse(res.data[0]);
                                                unitscore+=parseInt(d.point);
                                                if(--unitc==0){
                                                    resolve();
                                                }
                                            }
                                        }
                                    }
                                })                            
                            }).then(()=>{
                                // 保证顺序
                                unitObj[unit]=unitscore;
                                if(--count==0){
                                    re();
                                }
                            });
                        })                        
                    }).then(()=>{
                        Object.keys(unitObj).forEach(unit=>{
                            sttitle.innerHTML+=`<div ckass="unitscore"><p class="pwidth">${unit}</p><p class="pwidth">总分：${unitObj[unit]}</p></div>`;
                        })
                        let doc=document.querySelector('.class-section');
                        forcedclass=info;
                        // console.log(info.homework);
                        document.querySelector('.class-manage-section').classList.remove('is-shown');
                        doc.classList.add('is-shown');
                        let classnode=document.createElement('div');
                        classnode.innerHTML=`<div class="classid">班级编号：${info.classid}</div><div class="classname">班级名：${info.classname}</div>`
                        classnode.classList.add('classinfo');
                        doc.appendChild(classnode);
                        let line=document.createElement('div');
                        line.classList.add('line');
                        doc.appendChild(line);
                        doc.appendChild(sttitle);
                        let stuarray=[];
                        let promisearr=[];
                        for(let i=0;i<info.students.length;i++){
                            let pro=new Promise(resolve=>{
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
                                        resolve();
                                    }
                                }                            
                            });
                            promisearr.push(pro);
                        }
                        Promise.all(promisearr).then(()=>{
                            // 显示length不一样
                            stuarray.sort(function(a,b){
                                return a.studentid-b.studentid;
                            })
                            console.log(stuarray);
                            let studentinfo=document.createElement('div');
                            studentinfo.classList.add('studentinfo');
                            // 只显示部分学生的bug
                            let count=0;
                            for(let i=0;i<stuarray.length;i++){
                                let newnode=document.createElement('div');
                                newnode.classList.add('onestudent');
                                newnode.innerHTML= `<div class="student-info">
                                <p class="pwidth">${stuarray[i].studentid}</p>
                                <p class="pwidth">${stuarray[i].name}</p>
                                </div>`;
                                if(JSON.stringify(stuarray[i].score)!="{}"){
                                    Object.keys(stuarray[i].score).forEach(item=>{
                                        newnode.firstChild.innerHTML+=`<p class="pwidth">${stuarray[i].score[item].score}分</p>`
                                    });
                                }
                                studentinfo.appendChild(newnode);
                                count++;
                            }
                            doc.appendChild(studentinfo);
                        });                        
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
function getAccessToken(){
    return new Promise(resolve=>{
        const http=new XMLHttpRequest();
        const APPID='wx53d4c253e80f5250';
        const APPSECRET='99bfb8dd8bf3736bf4cd0103722b8fbc';
        http.open("GET",`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`);
        http.send();
        http.onreadystatechange=e=>{
            if(http.readyState==4){
                ACCESS_TOKEN=JSON.parse(http.responseText).access_token;
                resolve();
            }
        }
    })
}
var sameid=false;
function isSameId(id){
    // 是否有重复编号
    return new Promise(resolve=>{
        let get=new XMLHttpRequest();
        get.open('POST',`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`);
        let data={
            "env":"fzuanswersystem-7g3gmzjw761ecfdb",
            "query":`db.collection(\'class\').where({classid:'${id}'}).limit(100).get()`
        }
        get.send(JSON.stringify(data));
        get.onreadystatechange=e=>{
            if(get.readyState==4){
                let res=JSON.parse(get.responseText);
                console.log(res);
                if(res.data.length>0){
                    showAnime('该班级编号已被占用！');
                    sameid=true;                    
                }
                resolve();
            }
        }           
    })
}
var samename=false;
function isSameName(name){
    // 是否有重复班级名
    return new Promise(resolve=>{
        let getht=new XMLHttpRequest();
        getht.open('POST',`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,true);
        let data={
            "env":"fzuanswersystem-7g3gmzjw761ecfdb",
            "query":`db.collection(\'class\').where({classname:'${classname}'}).limit(100).get()`
        };
        getht.send(JSON.stringify(data));
        getht.onreadystatechange=e=>{
            if(getht.readyState==4){
                let res=JSON.parse(getht.responseText);
                console.log(res);
                if(res.data.length>1){
                    samename=true;
                    resolve();
                }
            }
        }
    })
}
function addClassToServer(newid,newname){
    sameid=samename=false;
    isSameId(newid).then(()=>{
        if(sameid){
            return  ;
        }else{
            isSameName(newname).then(()=>{
                if(samename){
                    return  ;
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
                            students:[],
                            homework:{},
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
                                    newclassdiv.innerHTML=`<img class="class-icon" src="https://667a-fzuanswersystem-7g3gmzjw761ecfdb-1305763704.tcb.qcloud.la/%E7%8F%AD%E7%BA%A7%20(1).png?sign=5d1ed90016ab22619af6aa36b900fcf5&t=1624780057" />
                                    <button class="classBlock" onclick="getClassInfo(${newid})">${newname}</button>`
                                    newclassdiv.classList.add('oneclass');
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
            })
        }
    })
}
function addClassAction(){
    let newid=document.getElementById('newclassid').value;
    let newname=document.getElementById('newclassname').value;
    if(newid[0]=='0'){
        showAnime('禁止班级编号有前导0');
        return ;
    }

    // add record in class
    if(!ACCESS_TOKEN){
        getAccessToken().then(()=>{
            addClassToServer(newid,newname);
        })
    }else{
        addClassToServer(newid,newname);
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
                    newnode.id=i;
                    newnode.innerHTML=`<div class="homework-title">
                        <h3 class="showQuestions" onclick="showQuestions('${i}','${info[i].questions}')">${i}</h3>
                        <button class="addhomework-btn" onclick="addHomework('${i}','${classid}')">添加作业</button>
                        <input class="chance-input" id="chancenum"/>
                        <button class="addhomework-btn" onclick="setChance('${i}')">设置答题次数</button>
                    </div>`;
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
var RIGHTIMG="https://667a-fzuanswersystem-7g3gmzjw761ecfdb-1305763704.tcb.qcloud.la/%E7%A1%AE%E8%AE%A4%20%E6%AD%A3%E7%A1%AE.png?sign=9903412cd4405131d1e56bf30f21dd48&t=1624794311";
var FALSEIMG="https://667a-fzuanswersystem-7g3gmzjw761ecfdb-1305763704.tcb.qcloud.la/%E9%94%99%E8%AF%AF.png?sign=d3082b1f71629a9813867de929c100ee&t=1624794415"
function showQuestions(key,homework){
    // ${}占位符会把数组转成字符串
    hideAllHomework();
    let arr=homework.split(',');
    let div=document.getElementById(key);
    for(let j=0;j<arr.length;j++){
        let qnode=document.createElement('div');    // 该单元所有作业
        getQuestion(arr[j]).then(res=>{
            res=JSON.parse(res);
            let type=(res.type=='fillblack'?'填空题':'单选题');
            if(res.choosenum>1) type='多选题';
            let levelobj={
                'easy':'易',
                'medium':'中',
                'hard':'难'
            };
            // 题目有图片
            if(res.pictures){
                var ht2=new XMLHttpRequest();
                ht2.open("POST",`https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`);
                let data3={
                    "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                    "file_list":[{
                        "fileid":res.pictures,
                        "max_age":72000
                    }]
                };
                ht2.send(JSON.stringify(data3));
                ht2.onreadystatechange=e=>{
                    if(ht2.readyState==4){
                        let res1=JSON.parse(ht2.responseText);
                        console.log(res1);
                        if(res1.errcode==0){
                            let picture=res1.file_list[0].download_url;
                            qnode.innerHTML=`
                            <div class="workdata" onclick="showStudentWork('${res._id}')">
                                <div class="workdata-title">
                                    <p>${type}</p>
                                    <p>${levelobj[res.level]}</p>
                                    <button class="deletebtn" onclick="deleteQuestion('${res._id}','${res.classname}')">删除题目</button>
                                </div>
                                <div class="workdata-content">
                                    <p>问题：${res.content}</p>
                                    <img src=${picture} />
                                    <p>答案：${res.answer}</p>
                                    <p>解析：${res.analysis}</p>
                                </div>
                            </div>`;
                            let block=document.createElement('div');
                            block.classList.add('studentdid');
                            block.id=res._id;
                            block.innerHTML='';
                            for(let i=0;i<res.studentsdid.length;i++){
                                let img=FALSEIMG;
                                if(res.studentsdid[i].isRight){
                                    img=RIGHTIMG;
                                }
                                block.innerHTML+=`<div class="a-studentdid">
                                    <p>${res.studentsdid[i].studentid}</p>
                                    <p>${res.studentsdid[i].studentname}</p>
                                    <img class="right-icon" src=${img} />
                                </div>`
                            }
                            qnode.id='q'+res._id;
                            qnode.appendChild(block);
                            div.append(qnode);
                        }
                    }
                }
            }else{
                qnode.innerHTML=`
                <div class="workdata" onclick="showStudentWork('${res._id}')">
                    <div class="workdata-title">
                        <p>${type}</p>
                        <p>${levelobj[res.level]}</p>
                        <button class="deletebtn" onclick="deleteQuestion('${res._id}','${res.classname}')" >删除题目</button>             
                    </div>
                    <div class="workdata-content">
                        <p>问题：${res.content}</p>
                        <p>答案：${res.answer}</p>
                        <p>解析：${res.analysis}</p>
                    </div>
                </div>`;
                let block=document.createElement('div');
                block.classList.add('studentdid');
                block.id=res._id;
                block.innerHTML='';
                for(let i=0;i<res.studentsdid.length;i++){
                    let img=FALSEIMG;
                    if(res.studentsdid[i].isRight){
                        img=RIGHTIMG;
                    }
                    block.innerHTML+=`<div class="a-studentdid">
                        <p>${res.studentsdid[i].studentid}</p>
                        <p>${res.studentsdid[i].studentname}</p>
                        <img class="right-icon" src=${img} />
                    </div>`
                }
                qnode.id='q'+res._id;
                qnode.appendChild(block);
                div.append(qnode);
            }
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
// 删除问题
function deleteQuestion(id,classname){
    // 不处理学生已做过情况
    if(confirm('确认删除？')){
        // 删quesitons
        let http=new XMLHttpRequest();
        http.open("POST",`https://api.weixin.qq.com/tcb/databasedelete?access_token=${ACCESS_TOKEN}`);
        let data={
            "env":"fzuanswersystem-7g3gmzjw761ecfdb",
            "query": `db.collection(\"questions\").doc('${id}').remove()`
        };
        http.send(JSON.stringify(data));
        http.onreadystatechange=e=>{
            if(http.readyState==4){
                let res=JSON.parse(http.responseText);
                if(res.errcode==0){
                    // 删class
                    let http2=new XMLHttpRequest();
                    http2.open('POST',`https://api.weixin.qq.com/tcb/databaseupdate?access_token=${ACCESS_TOKEN}`);
                    let newdata=classinfo;
                    let quesnode=document.getElementById('q'+id);   // 要删除问题节点
                    let father=quesnode.parentNode;
                    newdata[father.id].questions=newdata[father.id].questions.filter(function(i){
                        return i!=id;
                    });
                    let data={
                        "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                        "query":`db.collection(\"class\").where({classname:'${classname}'}).update({data:{homework:${JSON.stringify(newdata)}}})`
                    }
                    http2.send(JSON.stringify(data));
                    http2.onreadystatechange=e=>{
                        if(http2.readyState==4){
                            let res=JSON.parse(http2.responseText);
                            console.log(res);
                            if(res.errcode==0){
                                showAnime('删除成功！');
                                father.removeChild(quesnode);
                            }
                        }
                    }
                }
            }            
        }
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
function setChance(key){
    console.log(key);
    let classid=document.querySelector('.classid').innerHTML.substring(5);
    const http=new XMLHttpRequest();
    http.open('POST',`https://api.weixin.qq.com/tcb/databaseupdate?access_token=${ACCESS_TOKEN}`);
    let newdata=classinfo;
    newdata[key].chance=document.getElementById('chancenum').value;
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
                showAnime('设置答题次数成功！');
                // forcedclass.homework[newunitname]=[];
                // document.getElementById('newunitname').value="";
                // loadUnitQuestions();
            }
        }
    }
}
function addHomework(key,classid){
    document.querySelector('.question-manage-section').classList.add('is-shown');
    document.querySelector('.question-section').classList.remove('is-shown');
    onLoad(key,classid);
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
    newdata[newunitname]={
        'chance':3,
        questions:[]
    };
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
                // 默认新章节次数是3
                forcedclass.homework[newunitname]={
                    "chance":3,
                    "questions":[]
                };
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
function onLoad(key,classname){
    console.log(classname);
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