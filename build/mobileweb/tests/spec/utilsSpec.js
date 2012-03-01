describe( 'isArray test', function () {
	describe('test', function () {
		it('if true', function () {
			expect(isArray(['teste'])).toEqual(true);
		});

		it('if false', function () {
			expect(isArray('teste')).toEqual(false);
		});
	});
});