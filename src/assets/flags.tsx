import React from 'react';

export const SVG_FLAGS: Record<string, React.ReactNode> = {
    us: (
        <svg viewBox="0 0 7410 3900" xmlns="http://www.w3.org/2000/svg">
            <path fill="#b31942" d="M0 0h7410v3900H0" />
            <path stroke="#FFF" strokeWidth="300" d="M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0" />
            <path fill="#0a3161" d="M0 0h2964v2100H0" />
            <g fill="#FFF">
                <path id="star_us" d="m247 90 70.534 217.082-184.66-134.164h228.253L176.466 307.082z" />
                <g id="star_row_us">
                    <use href="#star_us" /><use href="#star_us" x="494" /><use href="#star_us" x="988" /><use href="#star_us" x="1482" /><use href="#star_us" x="1976" /><use href="#star_us" x="2464" />
                </g>
                <g id="star_row_2_us" transform="translate(247 210)">
                    <use href="#star_us" /><use href="#star_us" x="494" /><use href="#star_us" x="988" /><use href="#star_us" x="1482" /><use href="#star_us" x="1976" />
                </g>
                <use href="#star_row_us" y="420" /><use href="#star_row_us" y="840" /><use href="#star_row_us" y="1260" /><use href="#star_row_us" y="1680" />
                <use href="#star_row_2_us" y="420" /><use href="#star_row_2_us" y="840" /><use href="#star_row_2_us" y="1260" />
            </g>
        </svg>
    ),
    ve: (
        <svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <g id="v_star_unit" transform="translate(0 -36)">
                    <path id="v_star_path" d="M0-5v5h3z" fill="#fff" transform="rotate(18 0 -5)" />
                    <use href="#v_star_path" transform="scale(-1 1)" />
                    <g transform="rotate(72)"><use href="#v_star_path" /><use href="#v_star_path" transform="scale(-1 1)" /></g>
                    <g transform="rotate(-72)"><use href="#v_star_path" /><use href="#v_star_path" transform="scale(-1 1)" /></g>
                    <g transform="rotate(144)"><use href="#v_star_path" /><use href="#v_star_path" transform="scale(-1 1)" /></g>
                    <g transform="rotate(-144)"><use href="#v_star_path" /><use href="#v_star_path" transform="scale(-1 1)" /></g>
                </g>
            </defs>
            <path fill="#cf142b" d="M0 0h180v120H0Z" />
            <path fill="#00247d" d="M0 80h180V0H0Z" />
            <path fill="#fc0" d="M0 0h180v40H0Z" />
            <g transform="translate(90 60)">
                {[-70, -45, -20, 0, 20, 45, 70].map((a, i) => (
                    <use key={i} href="#v_star_unit" transform={`rotate(${a}) translate(0 -25) scale(0.12)`} />
                ))}
            </g>
        </svg>
    ),
    eu: (
        <svg viewBox="0 0 810 540" xmlns="http://www.w3.org/2000/svg">
            <rect width="810" height="540" fill="#039" />
            <g fill="#fc0" transform="translate(405 270)">
                <g id="e-star">
                    <path id="st" d="M0-30l7 21h22l-18 13 7 21-18-13-18 13 7-21-18-13h22z" transform="scale(.6)" />
                </g>
                <use href="#e-star" y="-120" /><use href="#e-star" y="120" /><use href="#e-star" x="-120" /><use href="#e-star" x="120" />
                <use href="#e-star" transform="rotate(30) translate(0 -120)" /><use href="#e-star" transform="rotate(60) translate(0 -120)" />
                <use href="#e-star" transform="rotate(120) translate(0 -120)" /><use href="#e-star" transform="rotate(150) translate(0 -120)" />
                <use href="#e-star" transform="rotate(210) translate(0 -120)" /><use href="#e-star" transform="rotate(240) translate(0 -120)" />
                <use href="#e-star" transform="rotate(300) translate(0 -120)" /><use href="#e-star" transform="rotate(330) translate(0 -120)" />
            </g>
        </svg>
    )
};
