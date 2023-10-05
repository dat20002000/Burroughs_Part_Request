/**
 * @class CommonOfs
 * @brief VUE Mixin providing POTENTIAL shared OFS functionality. Tracking these in each project independently for now, will compare and merge later.
 * @author Kevin Browne<kevinbrowne@helixmail.com>
 * @version 1.0
 *
 */

export default {

	data: () => ({

		runningWithinOfs: null,
		ofsParentOrigin: null,

	}),

	methods: {

		/**
		 * Method to check the expected OFS config and properties as defined by the "ofs" object structure.
		 *
		 * @return (boolean)
		 */
		validatePluginConfiguration: function () {
			this.log('validatePluginConfiguration() - BEGIN');
			let self = this;


			// CHECK CONFIG VALUES

			// Assume all are valid
			let isValid = true;

			// Determine if any required config values are undefined, null, or empty strings
			Object.entries(this.ofs.config).forEach(function (entry) {
				if (entry[1].required === true && (typeof entry[1].value === 'undefined' || entry[1].value === null || entry[1].value.length === 0)) {
					isValid = false;
				}
			});

			// If any configuration values are invalid....
			if (isValid === false) {

				// Build message for logging to the console.  Don't output the values as they could contain sensitive invormation.
				self.log('==== OFS CONFIG ISSUE ====');
				Object.entries(this.ofs.config).forEach(function (entry) {

					let entryIsValid = true;

					if (entry[1].required === true && (typeof entry[1].value === 'undefined' || entry[1].value === null || entry[1].value.length === 0)) {
						entryIsValid = false;
					}

					self.log(entry[0] + ' --- ' + entry[1].description + ' --- [REQUIRED: ' + entry[1].required + '] --- [VALID: ' + entryIsValid + ']');
				});

			} else {

				// CONFIG APPEARS TO BE VALID, CHECK EXPECTED PROPERTIES

				// Determine if any required config values are undefined, null, or empty strings
				Object.entries(this.ofs.props).forEach(function (entry) {
					if (entry[1].required === true && (typeof entry[1].value === 'undefined' || entry[1].value === null || entry[1].value.length === 0)) {
						isValid = false;
					}
				});

				// If any properties are invalid....
				if (isValid === false) {

					// Build message for logging to the console.  Don't output the values as they could contain sensitive invormation.
					self.log('==== OFS PROPERTY ISSUE ====');
					Object.entries(this.ofs.props).forEach(function (entry) {

						let entryIsValid = true;

						if (entry[1].required === true && (typeof entry[1].value === 'undefined' || entry[1].value === null || entry[1].value.length === 0)) {
							entryIsValid = false;
						}

						self.log(entry[0] + ' --- ' + entry[1].description + ' --- [REQUIRED: ' + entry[1].required + '] --- [VALID: ' + entryIsValid + ']');
					});
				}

			}

			return isValid;

		}

	}
}
