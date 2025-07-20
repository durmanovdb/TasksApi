
function body_validator_middleware(validator) {
	return (req, res, next) => {
		if(validator(req.body))
			next()
		else
        	res.status(400).json({status:"error", error:{message:"Bad Request"}});
	};
}

function query_validator_middleware(validator) {
	return (req, res, next) => {
		if(validator(req.query))
			next()
		else
        	res.status(400).json({status:"error", error:{message:"Bad Request"}});
	};
}

function params_middleware(scheme_obj) {
	const integerRegex = new RegExp("^-?[0-9]+$");

	return (req, res, next) => {
		for(let key of Object.keys(req.params)) {
			if(scheme_obj[key]) {
				if(scheme_obj[key] == "integer") {
					if(integerRegex.test(req.params[key])) {
						req.params[key] = parseInt(req.params[key]);
					} else {
						res.status(400).json({status:"error", error:{message:"Bad Request"}});
						return;
					}
				}
			}
		}
		next();
	};
}

module.exports = {
	body_validator_middleware,
	query_validator_middleware,
	params_middleware,
}