'use strict';

const printers = require('../printers');

function pluck (matrix, column) {
	return matrix.map(r => r[column]);
}

const strategiesMap = {
	avg: vals => {
		return vals.reduce((tot, val) => tot + val, 0) / vals.length;
	},
	min: vals => {
		return vals.reduce((min, val) => Math.min(val, min), vals[0]);
	},
	max: vals => {
		return vals.reduce((max, val) => Math.max(val, max), vals[0]);
	},
	median: vals => {
		const obj = {};
		vals.forEach(v => {
			obj[v] = (obj[v] || 0) + 1;
		})
		let maxCount = 1;
		return Object.keys(obj).reduce((median, v) => {
			if (obj[v] > maxCount) {
				median = v;
				maxCount = obj[v];
			}
			return median;
		}, null) || 'none'
	}
};

class Reduce {
	constructor (opts) {
		this.strategy = opts.param;
		printers.configureMultiStep.call(this, [opts.body], '', opts.body);

		// const print = (/->print\((\w+)\)/.exec(opts.postSteps) || [])[1];


		// if (['qs', 'qo', 'url'].indexOf(print) > -1) {
		// 	this.postPrint = false;
		// 	this.queries = [opts.body + (opts.postSteps || '')];
		// } else {
		// 	this.postPrint = print;
		// 	this.queries = [opts.body + (opts.postSteps ? opts.postSteps.split('->print')[0] : '') + '->print(json)'];
		// }
	}

	print () {
		const KeenQuery = require('../keen-query');
		return KeenQuery.execute(this.queries[0])
			.then(res => {
				if (!this.postPrint) {
					return res;
				}
				const strategies = this.strategy === 'all' ? Object.keys(strategiesMap) : [this.strategy];
				res.rows = strategies.map(strategy => {
					return res.rows[0].map((r, i) => {
						if (i === 0) {
							return strategy;
						}
						return strategiesMap[strategy](pluck(res.rows, i))
					})
				});
				console.log(res)
				return printers(this.postPrint, res, this);
			})
	}
	toString () {
		return this.originalQuery;
	}
}

module.exports = Reduce;