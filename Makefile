.PHONY: install run test clean clean-all

install:
	# static site, nothing to install

run:
	uv run python -m http.server 8000

test:
	# no tests; check that index.html links each project relatively
	grep -q 'href="summer-school-2026/"' index.html && grep -q 'href="geospiel/"' index.html

clean:
	# nothing to clean

clean-all: clean
