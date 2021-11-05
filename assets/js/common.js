$(window).scroll(function(){
    var posScroll = $(document).scrollTop();
    if(posScroll >=40)
		$('#menu').fadeIn(400);
    else
		$('#menu').fadeOut(300);
});