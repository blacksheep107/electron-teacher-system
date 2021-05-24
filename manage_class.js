var globalData=require('./globalData');
console.log(globalData);
var ACCESS_TOKEN;
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
            console.log(ACCESS_TOKEN);
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
                    document.querySelector('.class-manage-section').classList.remove('is-shown');
                    let doc=document.querySelector('.class-section');
                    doc.classList.add('is-shown');
                    let classidnode=document.createElement('div');
                    classidnode.innerHTML='班级编号：'+info.classid;
                    let classnamenode=document.createElement('div');
                    classnamenode.innerHTML='班级名：'+info.classname;
                    doc.appendChild(classidnode);
                    doc.appendChild(classnamenode);
                    let studentinfo=document.createElement('div');
                    let stuattr=document.createAttribute('class');
                    stuattr.value='studentinfo';
                    studentinfo.setAttributeNode(stuattr);
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
                                // console.log(stuhttp.responseText);
                                if(stuhttp.readyState==4){
                                    let stinfo=JSON.parse(JSON.parse(stuhttp.responseText).data[0]);
                                    // console.log(stinfo);
                                    stuarray.push(stinfo);
                                    // console.log(stuarray);
                                    if(i==info.students.length-1){
                                        resolve();
                                    }                                    
                                }
                            }
                        }
                    }).then(()=>{
                        console.log(stuarray);
                        for(let i=0;i<stuarray.length;i++){
                            let newnode=document.createElement('div');
                            newnode.innerHTML=stuarray[i].studentid+'  '+stuarray[i].name+' '+'已完成题目数：'+stuarray[i].answeredquestions.length;
                            studentinfo.appendChild(newnode);
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
    let newid=document.createElement('div');
    newid.innerHTML='<label for=\'newclassid\'>新班级编号：</label><input id=\'newclassid\'>';
    let newname=document.createElement('div');
    newname.innerHTML='<label for=\'newclassname\'>新班级名字：</label><input id=\'newclassname\'>';
    let newbtn=document.createElement('div');
    newbtn.innerHTML='<button onclick=addClassAction()>添加</button>'
    const doc=document.querySelector('.class-section');
    newblock.prepend(newbtn);
    newblock.prepend(newname);
    newblock.prepend(newid);
    lData.teacherclass.push(newid);
    globalData.classname.push(newname);
}
function addClassAction(){
    let newid=document.getElementById('newclassid').value;
    let newname=document.getElementById('newclassname').value;
    // add record in class
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
                    alert('添加成功！');
                }
            }
        }
    })

}