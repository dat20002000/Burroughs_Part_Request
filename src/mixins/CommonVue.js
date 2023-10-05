/**
 * @class CommonVue
 * @brief VUE Mixin providing POTENTIAL shared Vue app functionality. Tracking these in each project independently for now, will compare and merge later.
 * @author Kevin Browne<kevinbrowne@helixmail.com>
 * @version 1.0
 *
 */

export default {

	data: () => ({

		// Snackbar Messages
		snackbar: false,
		snackbartext: '',
		snackbarcolor: 'blue',
		snackBarTimeout: 3000,

	}),

	methods: {

		/**
		 * Method to fire a postMessage event.  Used to communicate between frames, components, etc.
		 *
		 * @param obj (object) The data to include in the postMessage event.
		 * @param targetOrigin (string) The target origin.
		 * @return (void)
		 */
		postMessage: function (obj, targetOrigin) {
			this.log('postMessage() - BEGIN');
			this.log(obj);

			if (typeof window !== 'undefined' && window !== null) {
				window.top.postMessage(obj, targetOrigin);
			} else {
				this.log('postMessage() - ERROR: window or window is undefined or null!');
			}

			this.log('postMessage() END');

		},



		/**
		 * Method to make a request to a REST API.
		 *
		 * @param httpMethod (string) The HTTP method to use, GET or POST.
		 * @param endpointUrl (string) The endpoint URL.
		 * @param endpointUser (string) The endpoint username for use with HTTP Basic auth.
		 * @param endpointPassword (string) The endpoint password for use with HTTP Basic auth.
		 * @param requestObj (object) The request object.  Includes the payload data as well as any required local data for post-processing.
		 * @param handler (function) The handler function which should operate on the response.
		 * @return (void)
		 */
		makeApiRequest: function (httpMethod, endpointUrl, endpointUser, endpointPassword, requestObj, handler) {
			this.log('makeApiRequest() - BEGIN');
			this.log(httpMethod);
			this.log(endpointUrl);
			this.log(requestObj);

			let self = this;
			let header = new Headers();
			let reqBody = null;

			// If credentials were passed, set an Authorization header
			if (
				(typeof endpointUser !== 'undefined' && endpointUser !== null && endpointUser.length > 0) &&
				(typeof endpointPassword !== 'undefined' && endpointPassword !== null && endpointPassword.length > 0)
			) {
				header.append('Authorization', 'Basic ' + btoa(endpointUser + ':' + endpointPassword));
			} 
			// else if (typeof endpointAuth !== 'undefined'){
			// 	header.append('Authorization', 'Basic ' + endpointAuth);
			// }

			// If this is not an HTTP GET set the Content-Type header
			if (httpMethod !== 'GET') {
				header.append('Content-Type', 'application/json');
				reqBody = JSON.stringify(requestObj.payload);
			}
			// else if (httpMethod !== 'GET' && typeof endpointAuth !== 'undefined') {
			// 	header.append('Content-Type', 'application/x-www-form-urlencoded');
			// 	header.append('x-merchant-id', 'luXQxc3VY8uF7cI8Uos1f0smKdAN460tCr2C2TGGiAwhhE31');
			// 	header.append("Access-Control-Allow-Origin", "*");
			// 	reqBody = new URLSearchParams({
			// 		'grant_type' : 'client_credentials'
			// 	});
			// } else if (httpMethod === 'GET' && typeof bearerToken !=='undefined') {
			// 	header.append("AccessLicenseNumber", "2DC8B6F9FEB81201");
			// 	header.append("transId", requestObj);
			// 	header.append("transactionSrc", "2DC8B6F9FEB81201");
			// }

			fetch(endpointUrl,{
				method: httpMethod,
				body: reqBody,
				headers: header
			}).then((fetchResponse) => {
				if ((fetchResponse.status === 200 || fetchResponse.status === 210) && fetchResponse.ok === true) {
					
					if(handler !== null){
						handler(fetchResponse, endpointUrl, requestObj);
					}					
					
					return fetchResponse;
				} else {
					self.showSnackBar('red', 'Error ' + fetchResponse.status + ' executing HTTP ' + httpMethod + ' against endpoint: ' + endpointUrl);
				}
			}).catch((e) => {
				self.showSnackBar('red', 'makeApiRequestFetch() - ' + e, 3000);
			})
		},



		/**
		 * Method which is responsible for displaying a visual "snackbar" message to the user.
		 *
		 * @param color (string) The textual color value. Ex: red, green, blue, orange, etc.  Or a hexadecimal value can be used.
		 * @param text (string) The text to display in the message.
		 * @param timeout (integer) The timeout value.  Defaults to 6 seconds.
		 * @return (void)
		 */
		showSnackBar: function (color, text, timeout = 2000) {
			this.log('showSnackBar() - MESSAGE: ' + text);

			this.snackBarTimeout = timeout;
			this.snackbarcolor = color;
			this.snackbartext = text;
			this.snackbar = true;
		},



		/**
		 * Method to create console.log messages in a structured format.  Member of VUE methods object.
		 *
		 * @param val (string) The text to log.
		 * @return (void)
		 */
		log: function (val) {

			if (typeof val === 'object') {

				// Adjusted the object logging to output JSON instead of an object.  Many times the object could not be expanded
				// in the console due to it changing after it was initially output.  This solves that problem plus with the additional header
				// it's a-bit easier to troubleshoot since we can now filter the console log by the Vue project name (couldn't do this with the
				// object since they did not match).
				//
				// eslint-disable-next-line
				// console.log(val);
				let header = new Date().toISOString().slice(0, 19).replace("T", " ") + ' ' + window.location.host + ' ' + this.$options.name + '/' + (typeof this.$options.__file !== 'undefined' ? this.$options.__file.replace('src/', '') : '') + ':';
				console.log( header + "\n" + JSON.stringify(val, null, 4) );

			} else {
				// eslint-disable-next-line
				console.log(new Date().toISOString().slice(0, 19).replace("T", " ") + ' ' + window.location.host + ' ' + this.$options.name + '/' + (typeof this.$options.__file !== 'undefined' ? this.$options.__file.replace('src/', '') : '') + ': ' + val);
			}
		}


	}

}
