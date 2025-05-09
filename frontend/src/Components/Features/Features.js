import React from 'react';
import { Carousel, CarouselControl, CarouselIndicators, CarouselItem } from 'reactstrap';
import features from '../../Data/features';
import './Features.css';

// Keep the same images for now as requested by the user
const items = [
	{
		src: 'https://i.imgur.com/wKeBuuY.png',
		alt: 'SJSU TeleHealth video consultation'
	},
	{
		src: 'https://i.imgur.com/yN1hGTi.png',
		alt: 'SJSU TeleHealth appointment scheduling'
	},
	{
		src: 'https://i.imgur.com/dmNBC61.png',
		alt: 'SJSU TeleHealth digital prescription'
	},
	{
		src: 'https://i.imgur.com/egLZkQ0.png',
		alt: 'SJSU TeleHealth mobile app'
	}
];

const Features = () => {
	const [ activeIndex, setActiveIndex ] = React.useState(0);
	const [ animating, setAnimating ] = React.useState(false);

	const onExiting = () => {
		setAnimating(true);
	};
	const onExited = () => {
		setAnimating(false);
	};
	const next = () => {
		if (animating) return;
		const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
		setActiveIndex(nextIndex);
	};
	const previous = () => {
		if (animating) return;
		const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
		setActiveIndex(nextIndex);
	};
	const goToIndex = (newIndex) => {
		if (animating) return;
		setActiveIndex(newIndex);
	};

	const slides = items.map((item) => {
		return (
			<CarouselItem onExiting={onExiting} onExited={onExited} key={item.src}>
				<img src={item.src} alt={item.alt} width="100%" className="img-fluid" />
			</CarouselItem>
		);
	});

	return (
		<section id="features">
			<div className="container">
				{/* Section Header */}
				<div className="row mb-5">
					<div className="col-12 text-center">
						<h2 className="features-section-title">How SJSU TeleHealth Works</h2>
						<p className="features-section-subtitle">
							Access healthcare from anywhere with our simple three-step process designed specifically for SJSU students.
						</p>
					</div>
				</div>

				{/* Content Row */}
				<div className="row">
					{/* Steps Column */}
					<div className="col-lg-6 align-self-center mb-5 mb-lg-0">
						<ul>
							{features.map((feature) => (
								<li key={feature.icon}>
									<div className="d-flex">
										<div className="icon">
											<span>{feature.icon}</span>
										</div>
										<div className="features-item-text">
											<h6>{feature.title}</h6>
											<p>{feature.description}</p>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>

					{/* Image Column */}
					<div className="col-lg-6">
						<div className="features-carousel-container">
							<Carousel
								activeIndex={activeIndex}
								next={next}
								previous={previous}
								keyboard={false}
								pause={false}
								ride="carousel"
								interval={3000}
								slide={false}
								className="carousel-fade"
							>
								<CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
								{slides}
								<CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
								<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
							</Carousel>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Features;
