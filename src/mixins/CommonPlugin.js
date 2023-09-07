export default {
	methods:{
		/**
		 * Method to handle post message events sent between frames.  Member of VUE methods object.
		 *
		 * This method performs various functions related to data and messages being sent between frames (usually VUE components)
		 * on the page.  Examples are, applying the address or credit card information to the order.
		 *
		 * @param e (object) The postMessage() event object.
		 * @return (void)
		 */
		handleOfsPostMessage: function(e)
		{


			//if (e.origin.includes('oraclecloud.com'))
			//	{
			this.log('handleOfsPostMessage() - postMessage IN <--');
			this.log(e);

			if (typeof e.data === 'undefined') {
				this.log(window.location.host + ' <- NO DATA ' + this._getDomain(e.origin), null, null, true);

				return false;
			}

			if (!this._isJson(e.data)) {
				this.log(window.location.host + ' <- NOT JSON ' + this._getDomain(e.origin), null, null, true);

				return false;
			}
			
			var ofsData = JSON.parse(e.data);

			switch (ofsData.method) {
			case 'init':
				this.log('handleOfsPostMessage() - FS INIT method');
				this.log(ofsData);
				this.pluginInitEnd(ofsData);
				break;

			case 'open':
				this.log('handleOfsPostMessage() - FS open method');
				this.log(ofsData);
				this.pluginOpen(ofsData);
				break;

			case 'wakeup':
				this.pluginWakeup(ofsData);
				break;

			case 'error':
				this.showSnackBar('red', 'Error ' + ofsData.errors[0].code);
				break;

			case 'updateResult':
				this.processUpdateResult(document, e.data);
				break;

			case 'callProcedureResult':
				this.processProcedureResult(ofsData);
				break;

			default:
				//	this.processProcedureResult(document, e.data);
				this._log(window.location.host + ' <- UNKNOWN METHOD: ' +ofsData.method + ' ' + this._getDomain(event.origin), null, null, true);
				break;
			}
			if (ofsData.method === 'wakeup')
			{
				this.log('handleOfsPostMessage() - FS wakeup method');
				this.log(ofsData);


			}
	
		},    


		/**
		 * Method to fire a postMessage event.  Used to communicate between frames, components, etc.
		 *
		 * @param msg (object) The data to include in the postMessage event.
		 * @param targetOrigin (string) The target origin.
		 * @return (void)		
		 */
		postMessage: function(msg, targetOrigin)
		{
			var isString = 'string' === typeof msg;
			// ignore non-ofs message
			if (!isString) {
				if (!isString && msg.type) return;
			}
			this.log('postMessage() - BEGIN');
			this.log(msg);
			if (targetOrigin ==='') {
				var originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';
				var domain = originUrl ? this._getDomain(originUrl) : '*OFS*';
				targetOrigin = originUrl ? this._getOrigin(originUrl) : '*';
			// var targetOrigin = this._getOrigin('https://example.com'); // Use URL of OFS App here to protect from unauthorized embedding
			}
			if (targetOrigin) {
				this.log(window.location.host + ' -> ' + (isString ? '' : msg.method) + ' ' + domain, isString ? msg : JSON.stringify(msg, null, 4));
			} else {
				this.log(window.location.host + ' -> ' + (isString ? '' : msg.method) + ' ERROR. UNABLE TO GET REFERRER');
			}

			if (typeof window !== 'undefined' && window !== null)
			{
				window.top.postMessage(msg, targetOrigin);

			}
			else
			{
				this.log('postMessage() - ERROR: window or window is undefined or null!');
			}

			this.log('postMessage() END');

		},


		/**
		 * Method which is responsible for displaying a visual "snackbar" message to the user.
		 *
		 * @param color (string) The textual color value. Ex: red, green, blue, orange, etc.  Or a hexadecimal value can be used.
		 * @param text (string) The text to display in the message.
		 * @return (void)
		 */
		showSnackBar: function(color, text)
		{
			this.log('showSnackBar()');
			this.log('showSnackBar() - ' + text);

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
		log: function(val)
		{
			if (typeof val === 'object')
			{
				// eslint-disable-next-line
						console.log(val);
			}
			else
			{
				// eslint-disable-next-line
						console.log(new Date().toISOString().slice(0, 19).replace("T", " ") + ' ' + window.location.host + '/' + this.$options.name + ' ' + val);
			}
		},
		/**
	 * Check for string is valid JSON
         * @param {*} str - String that should be validated
         * @returns {boolean}
         */
		_isJson: function (str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		},
		/**
         * Return domain of URL
         * @param {String} url
         * @returns {String}
         *
         */
		_getDomain: function (url) {
			if (url != '') {
				if (url.indexOf("://") > -1) {
					return url.split('/')[2];
				} else {
					return url.split('/')[0];
				}
			}

			return '';
		},

		/**
	 * Return origin of URL (protocol + domain)
	 * @param {String} url
	 * @returns {String}
	 */
		_getOrigin: function (url) {
			if (url != '') {
				if (url.indexOf("://") > -1) {
					return 'https://' + url.split('/')[2];
				} else { 	
					return 'https://' + url.split('/')[0];
				}
			}

			return '';
		},
		/**
         * Business login on plugin init end
         *
         * @param {Object} data - JSON object that contain data from OFS
         */
		pluginInitEnd: function (data) {
			this.saveToLocalStorage(data)

			var msg = {
				apiVersion: 1,
				method: "initEnd",
				wakeupNeeded: true,
				"wakeOnEvents": {
					"timer": { wakeupDelay: 15, sleepTimeout: 1800 }
				}
			};
			this.postMessage(msg, '');

		},


		localStorageGetItem: function (key) {
			return localStorage.getItem(this.localStoragePrefix + '-' + key);
		},

		localStorageSetItem: function (key, value) {
			return localStorage.setItem(this.localStoragePrefix + '-' + key, value);
		},

		localStorageRemoveItem: function (key) {
			return localStorage.removeItem(this.localStoragePrefix + '-' + key);
		},

		/**
 * Business login on plugin init
 */
		saveToLocalStorage: function (data) {
			this.log(window.location.host + ' INIT. SET DATA TO LOCAL STORAGE', JSON.stringify(data, null, 4));

			this.localStorageSetItem('pluginInitData', JSON.stringify(data));
		},

		/**
 * Business login on plugin open
 *
 * @param {Object} receivedData - JSON object that contain data from OFS
 */
		pluginOpen: function (receivedData) {
			this.apiUser = ofsData.securedData.netsuiteApiUser;
			this.apiPassword = ofsData.securedData.netsuiteApiPassword;

			this.requestSearchEndpoint = ofsData.securedData.requestSearchEndpoint;

			this.activityId = ofsData.activity.aid;

			this.resourceId = ofsData.resource.external_id;

			if (!window.location.href.includes('localhost')) this.resourceLOB = ofsData.resource.burrough_resource_lob_txt;

			this.readCache();


		},

		/**
 * Business login on plugin wakeup (background open for sync)
 *
 * @param {Object} receivedData - JSON object that contain data from OFS
 */
		pluginWakeup: async function (receivedData) {
			this.log(window.location.host + ' WAKEUP', JSON.stringify(receivedData, null, 4));

		},
		handleOfsScan: function (dataToSend) {
			this.postMessage(dataToSend, '');
		},
		processProcedureResult: function (receivedData) {
			this.log(window.location.host + ' WAKEUP', JSON.stringify(receivedData, null, 4));
			//this.partSearchField = receivedData.resultData.text;
		},
		generateCallId () {
			return btoa(String.fromCharCode.apply(null, window.crypto.getRandomValues(new Uint8Array(16))));
		},
		isObject: function(o) { return typeof o == "object" }

	}
}
