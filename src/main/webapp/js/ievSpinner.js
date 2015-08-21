/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


goog.provide('iev.spinner');


iev.spinner = function(){
   this.msg = "Closure is working";
};


iev.spinner.prototype.showmsg = function(){
    alert(this.msg);
};