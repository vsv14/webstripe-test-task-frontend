import $ from 'jquery';
import Modal from 'bootstrap/js/dist/modal';


$(function(){
    $("#bttn-menu").on("click", event=>{
            $("#menu").toggleClass("menu-show");
    });
});