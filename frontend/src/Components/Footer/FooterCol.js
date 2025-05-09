import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FooterCol = (props) => {
	return (
		<div className="col-md-3 footer-col">
			<h6>{props.menuTitle ? props.menuTitle : ' '}</h6>
			<ul>
				{props.menuItems.map((item, index) => (
					<li key={index}>
						{item.link.startsWith('http') ? (
							<a href={item.link} target="_blank" rel="noopener noreferrer">
								{item.icon && <FontAwesomeIcon icon={item.icon} className="me-2" />}
								{item.name}
							</a>
						) : (
							<Link to={item.link}>
								{item.icon && <FontAwesomeIcon icon={item.icon} className="me-2" />}
								{item.name}
							</Link>
						)}
					</li>
				))}
			</ul>
			{props.children && props.children}
		</div>
	);
};

export default FooterCol;
