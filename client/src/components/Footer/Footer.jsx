
import React from "react";
import { Link } from "react-router-dom";
import {
    FiFacebook,
    FiInstagram,
    FiTwitter,
    FiYoutube,
    FiMail,
    FiPhone,
    FiMapPin,
    FiArrowRight,
    FiShield,
    FiTruck,
    FiCreditCard,
    FiHeadphones,
} from "react-icons/fi";

import "./Footer.scss";

const Footer = () => {
    const handleNewsletterSubmit = (e) => {
        e.preventDefault();

        const email = e.target.email.value.trim();

        if (!email) return;

        console.log("Newsletter subscription:", email);

        e.target.reset();
    };

    return (
        <footer className="footer">

            {/* NEWSLETTER */}
            <section className="footer-newsletter">
                <div className="footer-container footer-newsletter__inner">

                    <div className="footer-newsletter__content">
                        <div className="footer-newsletter__icon">
                            <FiMail />
                        </div>

                        <div>
                            <span className="footer-eyebrow">
                                STAY UPDATED
                            </span>

                            <h2>
                                Get the latest deals
                                <br />
                                delivered to your inbox
                            </h2>

                            <p>
                                Subscribe and be the first to know
                                about new products, exclusive offers
                                and special discounts.
                            </p>
                        </div>
                    </div>

                    <form
                        className="footer-newsletter__form"
                        onSubmit={handleNewsletterSubmit}
                    >
                        <div className="footer-input">
                            <FiMail />
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                aria-label="Email address"
                                required
                            />
                        </div>

                        <button type="submit">
                            Subscribe
                            <FiArrowRight />
                        </button>

                        <small>
                            By subscribing, you agree to receive
                            promotional emails from us.
                        </small>
                    </form>

                </div>
            </section>

            {/*TRUST FEATURES*/}
            <section className="footer-features">
                <div className="footer-container footer-features__grid">

                    <div className="footer-feature">
                        <div className="footer-feature__icon">
                            <FiTruck />
                        </div>

                        <div>
                            <h4>Fast Delivery</h4>
                            <p>
                                Quick and reliable delivery
                                to your doorstep.
                            </p>
                        </div>
                    </div>

                    <div className="footer-feature">
                        <div className="footer-feature__icon">
                            <FiShield />
                        </div>

                        <div>
                            <h4>Secure Shopping</h4>
                            <p>
                                Your information is protected
                                with secure technology.
                            </p>
                        </div>
                    </div>

                    <div className="footer-feature">
                        <div className="footer-feature__icon">
                            <FiCreditCard />
                        </div>

                        <div>
                            <h4>Secure Payments</h4>
                            <p>
                                Pay safely with your preferred
                                payment method.
                            </p>
                        </div>
                    </div>

                    <div className="footer-feature">
                        <div className="footer-feature__icon">
                            <FiHeadphones />
                        </div>

                        <div>
                            <h4>24/7 Support</h4>
                            <p>
                                Our support team is always
                                ready to help.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* MAIN FOOTER */}
            <section className="footer-main">
                <div className="footer-container footer-main__grid">

                    {/* BRAND */}
                    <div className="footer-brand">

                        <Link
                            to="/"
                            className="footer-logo"
                        >
                            <span>DIRECT</span>
                            <strong>LINKS</strong>
                        </Link>

                        <p>
                            Your trusted online marketplace for
                            quality products at great prices.
                            Discover, shop and enjoy convenient
                            delivery right to your doorstep.
                        </p>

                        <div className="footer-contact">

                            <a href="tel:+2347044559139">
                                <FiPhone />
                                <span>
                                    +2347044559139
                                </span>
                            </a>

                            <a href="mailto:support@shophub.com">
                                <FiMail />
                                <span>
                                    lennonabu21@yahoo.com
                                </span>
                            </a>

                            <div>
                                <FiMapPin />
                                <span>
                                    Lagos, Nigeria
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* SHOP */}
                    <div className="footer-column">
                        <h3>Shop</h3>

                        <Link to="/products">
                            All Products
                        </Link>

                        <Link to="/products?sort=newest">
                            New Arrivals
                        </Link>

                        <Link to="/products?featured=true">
                            Featured Products
                        </Link>

                        <Link to="/products?discount=true">
                            Deals & Discounts
                        </Link>

                        <Link to="/categories">
                            Categories
                        </Link>

                        <Link to="/products">
                            Best Sellers
                        </Link>
                    </div>

                    {/* CUSTOMER SERVICE */}
                    <div className="footer-column">
                        <h3>Customer Service</h3>

                        <Link to="/contact">
                            Contact Us
                        </Link>

                        <Link to="/help">
                            Help Center
                        </Link>

                        <Link to="/shipping">
                            Shipping Information
                        </Link>

                        <Link to="/returns">
                            Returns & Refunds
                        </Link>

                        <Link to="/orders">
                            Track Your Order
                        </Link>

                        <Link to="/faq">
                            Frequently Asked Questions
                        </Link>
                    </div>

                    {/* ABOUT */}
                    <div className="footer-column">
                        <h3>About Us</h3>

                        <Link to="/about">
                            About
                        </Link>

                        <Link to="/careers">
                            Careers
                        </Link>

                        <Link to="/sell">
                            Sell on DirectLinks
                        </Link>

                        <Link to="/affiliate">
                            Affiliate Program
                        </Link>

                        <Link to="/terms">
                            Terms & Conditions
                        </Link>

                        <Link to="/privacy">
                            Privacy Policy
                        </Link>
                    </div>

                    {/* FOLLOW */}
                    <div className="footer-column footer-social-column">

                        <h3>Follow Us</h3>

                        <p>
                            Follow us on social media for
                            exclusive deals and updates.
                        </p>

                        <div className="footer-socials">

                            <a
                                href="#facebook"
                                aria-label="Facebook"
                            >
                                <FiFacebook />
                            </a>

                            <a
                                href="#instagram"
                                aria-label="Instagram"
                            >
                                <FiInstagram />
                            </a>

                            <a
                                href="#twitter"
                                aria-label="Twitter"
                            >
                                <FiTwitter />
                            </a>

                            <a
                                href="#youtube"
                                aria-label="YouTube"
                            >
                                <FiYoutube />
                            </a>

                        </div>

                        <div className="footer-app">
                            <span>Shop on the go</span>

                            <div className="footer-app-buttons">

                                <a href="#google-play">
                                    <small>GET IT ON</small>
                                    <strong>
                                        Google Play
                                    </strong>
                                </a>

                                <a href="#app-store">
                                    <small>DOWNLOAD ON THE</small>
                                    <strong>
                                        App Store
                                    </strong>
                                </a>

                            </div>
                        </div>

                    </div>

                </div>
            </section>


            {/*PAYMENT / SECURITY*/}
            <section className="footer-payments">
                <div className="footer-container footer-payments__inner">

                    <div className="footer-payment-group">
                        <span>We Accept</span>
                        <div className="payment-icons">
                            <div>VISA</div>
                            <div>Mastercard</div>
                            <div>Verve</div>
                            <div>Paystack</div>

                        </div>
                    </div>

                    <div className="footer-payment-group">
                        <span>Secure Shopping</span>

                        <div className="secure-badge">
                            <FiShield />

                            <div>
                                <strong>100% Secure</strong>
                                <small>
                                    SSL Protected
                                </small>
                            </div>
                        </div>
                    </div>

                </div>
            </section>


            {/* COPYRIGHT */}
            <section className="footer-bottom">
                <div className="footer-container footer-bottom__inner">

                    <p>
                        © {new Date().getFullYear()} DirectLinks.
                        All rights reserved.
                    </p>

                    <div className="footer-bottom__links">
                        <Link to="/privacy">
                            Privacy
                        </Link>

                        <Link to="/terms">
                            Terms
                        </Link>

                        <Link to="/cookies">
                            Cookies
                        </Link>
                    </div>

                    <p className="footer-made">
                        Made with ❤️ in Nigeria
                    </p>

                </div>
            </section>

        </footer>
    );
};

export default Footer;