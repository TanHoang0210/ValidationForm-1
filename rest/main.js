
function Validator(options){
    //hàm lấy thẻ cha mong muốn
    function getParent(element,selector){
       while(element.parentElement){
          if(element.parentElement.matches(selector)){
            return element.parentElement
          }
          element = element.parentElement
       }
    }
    var selectorRules = {}
    //in ra thôn báo
    function validates(inputEle,rule){
        var errEle = getParent(inputEle,options.formGroupSelector)
        var errMes;
        //lấy rra các rule của selector
        var rules = selectorRules[rule.selector]
        //lặp ra từng rule và kiểm tra
        for(var i =0; i<rules.length;i++){
            switch (inputEle.type) {
                case 'radio':
                case 'checkbox':
                    errMes = rules[i](formElement.querySelector(rule.selector+':checked'))
                     break;
                default:
                    errMes = rules[i](inputEle.value)
            }

           //nếu có lỗi thì dừng
           if(errMes) break;
        }
        if(errMes){
            getParent(inputEle,options.formGroupSelector).querySelector('.form-message').textContent = errMes
            getParent(inputEle,options.formGroupSelector).classList.add('invalid')
           }
           else{
            getParent(inputEle,options.formGroupSelector).querySelector('.form-message').textContent = ''
            getParent(inputEle,options.formGroupSelector).classList.remove('invalid')
           }
           return !errMes
    }
//;ấy element cuar for  cần validate
    var formElement = document.querySelector(options.form)
    if(formElement){
        formElement.onsubmit =  function(e){
            //k có sự kiện khi submit
            //e.preventDefault();
            var isFormValid = true;
            //lặp lại tất cả rule khi submit
            options.rules.forEach(function(rule){
                var inputEle = formElement.querySelector(rule.selector)
                var isValid =  validates(inputEle,rule)
                if(!isValid){
                    isFormValid = false
                }
            })
           
            if(isFormValid){    
                if(typeof options.onSubmit=== 'function'){
                    var enableInput = formElement.querySelectorAll('[name]')
                    var formValue = Array.from(enableInput).reduce(function(values, input){
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name ="'+input.name +'"]:checked').value;
                                break;
                            case 'checkbox': 
                            if(!input.matches(':checked')){
                                values[input.name] = '';
                                 return values
                                };
                            if(!Array.isArray(values[input.name])){
                                values[input.name]=[];
                            }
                            values[input.name].push(input.value)
                            break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                            values[input.name] = input.value
                        }

                          return values//return ra values vì && return ra phần tử cuối
                    },{});
                    //call API
                    options.onSubmit(formValue)
                }
            }
        }
        //xử lý lặp qua mỗi rule và lắng nghe sự kiện
            options.rules.forEach(rule => {
                //lưu lại các rules
                if(Array.isArray(selectorRules[rule.selector])){
                    selectorRules[rule.selector].push(rule.test)
                }else{
                    selectorRules[rule.selector] = [rule.test];
                }
                var inputEles = formElement.querySelectorAll(rule.selector)

                Array.from(inputEles).forEach(function(inputEle){
                    if(inputEle)
                        //xử lý blur khỏi input
                        inputEle.onblur = function(){
                            validates(inputEle,rule)
                        }
                        //xử lý khi đang nhập 
                        inputEle.oninput = function(){
                            getParent(inputEle,options.formGroupSelector).querySelector('.form-message').textContent = ''
                            getParent(inputEle,options.formGroupSelector).classList.remove('invalid')
                        }
                })

            });
    }
}
//khi có lỗi trả ra message lỗi
//khi hợp lệ k trả về gì cả
Validator.isRequired = function(selector,message){
    return {
        selector: selector,//laáy ra fullname
        test:function(value){
            return value ? undefined :message|| 'vui lòng nhập trường này'
        }
    };
}
Validator.isEmail = function(selector){
    return {
        selector: selector,//lấy email
        test:function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng email'
        }
    };
    
}
Validator.minLength = function(selector,min){
    return {
        selector: selector,//lấy email
        test:function(value){
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    };
    
}
Validator.isConfirmed = function(selector,getConfirmValue,message){
    return {
        selector: selector,//lấy email
        test:function(value){
            return value=== getConfirmValue() ? undefined : message||`Giá trị nhập vào không hợp lệ`//khi có message thì in ra mes không thì in ra dòng sau
        }
    };
    
}


