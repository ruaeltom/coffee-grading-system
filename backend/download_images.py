from icrawler.builtin import BingImageCrawler

datasets = {
    "Fresh": [
        "fresh coffee cherry",
        "green coffee fruit",
        "red coffee cherry fresh"
    ],
    "Mixed": [
        "mixed coffee cherries drying",
        "coffee cherries green red black mix"
    ],
    "Partially_dried": [
        "partially dried coffee cherries",
        "coffee cherries sun drying defects"
    ],
    "Fully_dried": [
        "fully dried coffee cherries",
        "black dried coffee fruit no defects"
    ]
}

for folder, queries in datasets.items():
    for query in queries:
        crawler = BingImageCrawler(
            storage={"root_dir": folder}
        )
        crawler.crawl(
            keyword=query,
            max_num=50
        )
