var globalData=require('./globalData');
function loginAction(e){
    var id=document.getElementById('id').value;
    var password=document.getElementById('password').value;
    requestwxData(id,password);
}
function requestwxData(id,password){
    id=String(id);
    const http=new XMLHttpRequest();
    const APPID='wx53d4c253e80f5250';
    const APPSECRET='99bfb8dd8bf3736bf4cd0103722b8fbc';
    http.open("GET",`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`);
    http.send();
    http.onreadystatechange=e=>{
        console.log(http.responseText);
        if(http.readyState==4&&http.status==200){
            let ACCESS_TOKEN=JSON.parse(http.responseText).access_token;
            console.log(ACCESS_TOKEN);
            var ht=new XMLHttpRequest();
            ht.open('POST',`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,true);
            let data={
                "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                "query":`db.collection(\'teacher\').where({id:'${id}'}).limit(100).get()`
            }
            ht.send(JSON.stringify(data));
            ht.onreadystatechange=e=>{
                if(ht.readyState==4){
                    // console.log(JSON.parse(ht.responseText));
                    if(JSON.parse(ht.responseText).data.length==0){
                        const wrongpass=document.querySelector('.wrongpass');
                        wrongpass.classList.add('is-shown');
                    }else{
                        let info=JSON.parse(JSON.parse(ht.responseText).data);
                        let corretpass=info.password;
                        if(corretpass==password){
                            globalData.teacherid=id;
                            globalData.teacherpassword=corretpass;
                            globalData.teacherclass=info.class;
                            const alldoc=document.querySelector('.login-section');
                            alldoc.classList.add('is-hidden');
                            document.querySelector('.class-manage-section').classList.add('is-shown');
                            const navbutton=document.querySelector('.nav-category-manageclass>button');
                            navbutton.classList.add('is-selected');
                            const manageclass=document.querySelector('.class-list');
                            console.log(info.class);
                            for(let i=0;i<info.class.length;i++){
                                let newdiv=document.createElement('div');
                                newdiv.classList.add('oneclass');
                                let newNode=document.createElement('button');
                                newNode.innerHTML=info.class[i].classname;
                                let attr=document.createAttribute('class');
                                attr.value='classBlock';
                                let click=document.createAttribute('onclick');
                                click.value=`getClassInfo(${info.class[i].classid})`;
                                let data=document.createAttribute('data-classid');
                                data.value=info.class[i].classid;
                                newNode.setAttributeNode(attr);
                                newNode.setAttributeNode(click);
                                newNode.setAttributeNode(data);
                                newdiv.innerHTML+=`<img class="class-icon" src="https://667a-fzuanswersystem-7g3gmzjw761ecfdb-1305763704.tcb.qcloud.la/%E7%8F%AD%E7%BA%A7%20(1).png?sign=5d1ed90016ab22619af6aa36b900fcf5&t=1624780057" />`;
                                newdiv.appendChild(newNode);
                                manageclass.appendChild(newdiv);
                            }
                        }else{
                            const wrongpass=document.querySelector('.wrongpass');
                            wrongpass.classList.add('is-shown');
                        }                        
                    }

                }

            }
        }
    }
}
function jumpRegister(){
    document.querySelector('.login-section').classList.add('is-hidden');
    
}