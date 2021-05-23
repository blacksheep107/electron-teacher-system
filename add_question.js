
var globalData;
var typearr=['选择题','填空题'];
function onLoad(){
    var doc=document.querySelector('.form');
    globalData=require('./globalData');
    console.log(globalData);
    // 添加下拉框
    let selectClass=document.createElement('select');
    selectClass.innerHTML='';
    for(let i=0;i<globalData.teacherclass.length;i++){
        selectClass.innerHTML+=`<option>${globalData.teacherclass[i].classname}</option>`;
    }
    doc.appendChild(selectClass);
    let selectType=document.createElement('select');
    let typeattr=document.createAttribute('id');
    typeattr.value='selectType';
    selectType.setAttributeNode(typeattr);
    selectType.innerHTML='';
    for(let i=0;i<typearr.length;i++){
        selectType.innerHTML+=`<option>${typearr[i]}</option>`;
    }
    doc.appendChild(selectType);
    document.getElementById('selectType').addEventListener('change',function(e){
        console.log(e.target.value);
        if(e.target.value=='选择题'){

        }else if(e.target.value=='填空题'){
            
        }
    });    
}
