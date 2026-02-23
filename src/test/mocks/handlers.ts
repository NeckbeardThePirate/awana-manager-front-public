import { http, HttpResponse } from 'msw';

// Mock data that matches the application's data structures
const mockBookData = {
	book_id: 1,
	book: 'Apple Seed',
	club_id: 2,
	book_number: 1,
};

const mockSectionData = [
	{
		section_id: 'unit1-section1',
		club: 'Cubbies',
		book_number: 1,
		book_name: 'Apple Seed',
		unit: 'Unit 1',
		section: '1',
		section_name: 'Creation',
	},
	{
		section_id: 'unit1-section2',
		club: 'Cubbies',
		book_number: 1,
		book_name: 'Apple Seed',
		unit: 'Unit 1',
		section: '2',
		section_name: 'Adam and Eve',
	},
	{
		section_id: 'unit2-section1',
		club: 'Cubbies',
		book_number: 1,
		book_name: 'Apple Seed',
		unit: 'Unit 2',
		section: '1',
		section_name: 'Noah',
	},
];

const mockProgressData = [
	{ section_id: 'unit1-section1' }, // Unit 1 Section 1 is complete
];

const mockClubbers = [
	{
		person_id: 1,
		first_name: 'John',
		last_name: 'Doe',
		club_id: 2,
		gender: 'Male',
		book_id: '1',
		team: 'Yellow',
	},
	{
		person_id: 2,
		first_name: 'Jane',
		last_name: 'Smith',
		club_id: 2,
		gender: 'Female',
		book_id: '2',
		team: 'Red',
	},
	{
		person_id: 3,
		first_name: 'Bob',
		last_name: 'Wilson',
		club_id: 3,
		gender: 'Male',
		book_id: '3',
		team: 'Blue',
	},
];

const mockReportsData = {
	dayReports: {
		'2024-01-15': {
			reports: {
				'report-1': {
					person_id: 1,
					progress_id: 1,
					section_id: 'unit1-section1',
					completed_dt: '1705300800000',
					reviewer_id: 'reviewer-1',
					book_id: 1,
					current_team: 'red',
				},
			},
			scores: {
				red: 5,
				blue: 3,
				green: 7,
				yellow: 2,
			},
		},
	},
};

const mockPointsData = {
	teamsResponse: {
		red: 10,
		yellow: 20,
		blue: 15,
		green: 25,
	},
};

export const handlers = [
	// Mock the clubbers endpoint
	http.get('http://localhost:3000/clubbers', ({ request }) => {
		const club = request.headers.get('club');

		if (!club) {
			return HttpResponse.json({ error: 'Missing club header' }, { status: 400 });
		}

		// Filter clubbers by club if needed
		return HttpResponse.json(mockClubbers);
	}),

	// Mock the single-clubber endpoint
	http.get('http://localhost:3000/single-clubber', ({ request }) => {
		const clubberId = request.headers.get('clubber-id');

		if (!clubberId) {
			return HttpResponse.json({ error: 'Missing clubber-id header' }, { status: 400 });
		}

		const clubber = mockClubbers.find((c) => String(c.person_id) === clubberId);
		if (!clubber) {
			return HttpResponse.json({ error: 'Clubber not found' }, { status: 404 });
		}

		return HttpResponse.json(clubber);
	}),

	// Mock the clubber-book-info endpoint
	http.get('http://localhost:3000/clubber-book-info', ({ request }) => {
		const bookId = request.headers.get('book-id');
		const clubberId = request.headers.get('clubber-id');

		if (!bookId || !clubberId) {
			return HttpResponse.json({ error: 'Missing required headers' }, { status: 400 });
		}

		return HttpResponse.json({
			bookData: mockBookData,
			sectionData: mockSectionData,
			progressData: mockProgressData,
		});
	}),

	// Mock the book-info endpoint
	http.get('http://localhost:3000/book-info', ({ request }) => {
		const bookId = request.headers.get('book-id');

		if (!bookId) {
			return HttpResponse.json({ error: 'Missing book-id header' }, { status: 400 });
		}

		const books: Record<string, typeof mockBookData> = {
			'1': { book_id: 1, book: 'Apple Seed', club_id: 2, book_number: 1 },
			'2': { book_id: 2, book: 'Honey Comb', club_id: 2, book_number: 2 },
			'3': { book_id: 3, book: 'Hang Glider', club_id: 3, book_number: 1 },
		};

		return HttpResponse.json(books[bookId] || mockBookData);
	}),

	// Mock the section-info endpoint
	http.get('http://localhost:3000/section-info', ({ request }) => {
		const sectionId = request.headers.get('section-id');

		if (!sectionId) {
			return HttpResponse.json({ error: 'Missing section-id header' }, { status: 400 });
		}

		const section = mockSectionData.find((s) => s.section_id === sectionId);
		if (!section) {
			return HttpResponse.json({
				section_id: sectionId,
				club: 'Unknown',
				book_number: 1,
				book_name: 'Unknown Book',
				unit: 'Unit 1',
				section: '1',
				section_name: 'Unknown Section',
			});
		}

		return HttpResponse.json(section);
	}),

	// Mock the reviewer-info endpoint
	http.get('http://localhost:3000/reviewer-info', ({ request }) => {
		const reviewerId = request.headers.get('reviewer-id');

		if (!reviewerId) {
			return HttpResponse.json({ error: 'Missing required headers' }, { status: 400 });
		}

		return HttpResponse.json({
			reviewer_id: reviewerId,
			email: `${reviewerId}@example.com`,
			first_name: 'Test',
			last_name: 'Reviewer',
		});
	}),

	// Mock the all-reports endpoint
	http.get('http://localhost:3000/all-reports', () => {
		return HttpResponse.json(mockReportsData);
	}),

	// Mock the clubber-report endpoint
	http.get('http://localhost:3000/clubber-report', ({ request }) => {
		const clubberId = request.headers.get('clubber-id');

		if (!clubberId) {
			return HttpResponse.json({ error: 'Missing clubber-id header' }, { status: 400 });
		}

		return HttpResponse.json([
			{
				person_id: parseInt(clubberId),
				progress_id: 1,
				section_id: 'unit1-section1',
				completed_dt: '1705300800000',
				reviewer_id: 'reviewer-1',
				book_id: 1,
				current_team: 'red',
			},
		]);
	}),

	// Mock the points-report endpoint
	http.get('http://localhost:3000/points-report', () => {
		return HttpResponse.json(mockPointsData);
	}),

	// Mock the update-clubber-section endpoint
	http.post('http://localhost:3000/update-clubber-section', ({ request }) => {
		const unitId = request.headers.get('unit_id');
		const sectionId = request.headers.get('section_id');
		const isComplete = request.headers.get('is_complete');
		const clubberId = request.headers.get('clubber_id');
		const helperId = request.headers.get('helper_id');
		const bookId = request.headers.get('book_id');

		// Validate required headers
		if (!unitId || !sectionId || isComplete === null || !clubberId || !helperId || !bookId) {
			return HttpResponse.json({ error: 'Missing required headers' }, { status: 400 });
		}

		// Simulate successful update
		return HttpResponse.json({
			success: true,
			message: 'Section updated successfully',
		});
	}),

	// Mock the update-clubber-gender endpoint
	http.post('http://localhost:3000/update-clubber-gender', ({ request }) => {
		const gender = request.headers.get('gender');
		const clubberId = request.headers.get('clubber_id');

		if (!gender || !clubberId) {
			return HttpResponse.json({ error: 'Missing required headers' }, { status: 400 });
		}

		return HttpResponse.json({
			success: true,
			message: 'Gender updated successfully',
		});
	}),

	// Mock the update-clubber-team endpoint
	http.post('http://localhost:3000/update-clubber-team', ({ request }) => {
		const team = request.headers.get('team');
		const clubberId = request.headers.get('clubber_id');

		if (!team || !clubberId) {
			return HttpResponse.json({ error: 'Missing required headers' }, { status: 400 });
		}

		return HttpResponse.json({
			success: true,
			message: 'Team updated successfully',
		});
	}),

	// Mock the update-clubber-book endpoint
	http.post('http://localhost:3000/update-clubber-book', ({ request }) => {
		const bookId = request.headers.get('bookId');
		const clubberId = request.headers.get('clubber_id');

		if (!bookId || !clubberId) {
			return HttpResponse.json({ error: 'Missing required headers' }, { status: 400 });
		}

		return HttpResponse.json({
			success: true,
			message: 'Book updated successfully',
		});
	}),

	// Mock the update-clubber-club endpoint
	http.post('http://localhost:3000/update-clubber-club', ({ request }) => {
		const clubId = request.headers.get('clubId');
		const clubberId = request.headers.get('clubber_id');

		if (!clubId || !clubberId) {
			return HttpResponse.json({ error: 'Missing required headers' }, { status: 400 });
		}

		return HttpResponse.json({
			success: true,
			message: 'Club updated successfully',
		});
	}),

	// Mock other potential endpoints that might be added
	http.get('http://localhost:3000/*', ({ request }) => {
		console.warn(`Unhandled GET request to ${request.url}`);
		return HttpResponse.json({ error: 'Endpoint not mocked' }, { status: 404 });
	}),

	http.post('http://localhost:3000/*', ({ request }) => {
		console.warn(`Unhandled POST request to ${request.url}`);
		return HttpResponse.json({ error: 'Endpoint not mocked' }, { status: 404 });
	}),
];
