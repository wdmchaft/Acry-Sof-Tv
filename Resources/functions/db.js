function getContextBy(tablename, field, value) {
	tablename = tablename || false;
	field = field || false;
	value = value || false;

	if ( tablename && field && value ) {
		var db = Ti.Database.install('../db/acrysof.sqlite', 'acrysof');
		var query = 'SELECT * FROM {tablename} WHERE {field} = \"{value}\"';

		// Replace tablename
		query = query.replace('\{tablename\}', tablename);
		//Replace field
		query = query.replace('\{field\}', field);
		// Replace value
		query = query.replace('\{value\}', value);

		var acryDB = db.execute(query);

		if ( acryDB ) {
			return acryDB;
		}
	} else {
		return false;
	}
}