/*主页面图片轮播*/

/*var carousel = function() {
	left -= 2;
	list.style.left = left + 'px';
	clearTimeout(time);
	if(left == -2238) {
		clearTimeout(time);
		goFirst();
	}
	if(left%746 == 0) return;
	var time = setTimeout('carousel()',1);
}
function goFirst() {
	left += 6;
	list.style.left = left + 'px';
	clearTimeout(t);
	if(left == 0) {
		console.log(left);
		clearTimeout(t);
		return;
	}
	var t = setTimeout("goFirst()",1);
}*/
var left = 0;
var status = 1;
var list = document.getElementById('js-list1');
window.onload = function() {
	var aaa = setInterval(carousel,  4000);
}
var t;
var carousel = function() {
	clearInterval(t);
	t = setInterval(moveTo,1);
}
var listsItem = document.getElementById('js-list2').getElementsByTagName('li');
var moveTo = function() {
	if(status == 1 ) {
		left--;
		if(left%100 == 0) {
			clearInterval(t);
			for (var i = 0; i < listsItem.length; i++) {
				listsItem[i].style.backgroundColor = "white";
			};
			var num = Math.abs(parseInt(left/100));
			listsItem[num].style.backgroundColor = "yellow";
		};
		if(left == -300) {
			status = 0;	
		}
	}
	else if (status == 0) {
		left += 4;
		if(left == 0) {
			status = 1;
			clearInterval(t);
			for (var i = 0; i < listsItem.length; i++) {
				listsItem[i].style.backgroundColor = "white";
			}
			var num = parseInt(left/100);
			listsItem[num].style.backgroundColor = "yellow";	
		}
	}
	list.style.left = left + '%';	
}
