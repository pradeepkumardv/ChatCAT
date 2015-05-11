module.exports = function(express,app,passport,config)
{
	var router = express.Router();

	router.get('/',function(req,res,next){
		res.render('index',{title:'Welome to ChatCAT'})
	});

	router.get('/chatrooms',securePages,function(req,res,next){
		res.render('chatrooms',{title:'Welcome to chatrooms', 'user':req.user,'config':config});
	});

	router.get('/auth/facebook',passport.authenticate('facebook'));
	router.get('/auth/facebook/callback',passport.authenticate('facebook',{
		successRedirect:'/chatrooms',
		failureRedirect:'/'
	}));

	router.get('/logout',function(req, res, next){

		req.logout();
		res.redirect('/');

	});


	function securePages(req,res,next)
	{
		if(req.isAuthenticated())
		{
			next();
		}
		else
		{
			res.redirect('/');
		}
	}
	/*router.get('/setcolor',function(req,res,next){
		
		req.session.favColor='Red';
		res.send('setting Fav color as Red');
	});

	router.get('/getcolor',function(req,res,next){
		
		res.send('Fav color is '+ req.session.favColor);
	});*/

	app.use('/',router);
}