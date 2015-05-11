module.exports = function(passport, FacebookStrategy, config, mongoose) {


    var chatUser = new mongoose.Schema({
        profileId: String,
        fullname: String,
        profilePic: String
    });

    var userModel = mongoose.model('chatUser', chatUser);

    passport.use(new FacebookStrategy({

        clientID: config.fb.appId,
        clientSecret: config.fb.appSecret,
        callbackURL: config.fb.callbackURL
    }, function(accessToken, refreshToken, profile, done) {

        // Check if the user exist in mongodb,
        // if not create one and return the profile
        // if exists, simply return the profile

        userModel.findOne({
                "profileId": profile.id
            },
            function(error, result) {

                if (result) {

                    done(null, result);
                } else {
                    var newChatUser = new userModel({
                        profileId: profile.id,
                        fullname: profile.displayName,
                        profilePic: 'http://graph.facebook.com/' + profile.id + '/picture'
                    });

                    newChatUser.save(function(err) {
                        done(null, newChatUser);
                    });
                }
            })
    }));

	// Add user Id (mongoDB doc id) to session
	passport.serializeUser(function(user,done){
		done(null,user.id);
	});

	// if user details are asked from session, gets user details from DB and returns
	passport.deserializeUser(function(id,done){
		userModel.findById(id, function(err,result){
			done(err,result);
		})
	});
}