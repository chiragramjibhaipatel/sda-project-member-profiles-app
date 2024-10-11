import React, {useState} from 'react'
import {useField, useInputControl} from "@conform-to/react";
import type {FieldName} from "@conform-to/dom";

export function RichTextEditorWrapper ({description}: { description: FieldName<string> }) {
    let [metaDescription] = useField (description);
    let metaDescriptionInput = useInputControl (metaDescription);
    const [richText, setRichText] = useState (metaDescriptionInput.value);
    
    return (
	<div dangerouslySetInnerHTML={{__html: getParsedValue ({value: JSON.parse (richText)})}}></div>
    )
}

//I want to create a Rich text editor that allow user to input text and save it to the database
//I will have feature of heading, bold, italic, bullet points, numbered list, and hyperlink
//the input will be saved as a JSON object in the database as per the schema

//First task is to convert JSON to HTML

function getLink ({value}: { value: any }) {
    
    const url = value.url;
    const title = value.title;
    const target = value.target;
    const text = getParsedValue ({value});
    return `<a href="${url}" title="${title}" target="${target}">${text}</a>`;
}

function getList ({value}: { value: any }) {
    const {listType} = value;
    if (listType === "unordered") {
	return `<ul>${value.children.map (item => {
	    return `<li>${getParsedValue ({value: item})}</li>`;
	}).join ("")}</ul>`;
    } else {
	return `<ol>${value.children.map (item => {
	    return `<li>${getParsedValue ({value: item})}</li>`;
	}).join ("")}</ol>`;
    }
}

function getParsedValue ({value}) {
    console.log ("Inside getParsedValue: ", value);
    if (!value) return "";
    return value.children.map (item => {
	switch (item.type) {
	    case "paragraph":
		return `<p>${getParsedValue ({value: item})}</p>`;
	    case "heading":
		return getHeading ({value: item});
	    case "link":
		return getLink ({value: item});
	    case "list":
		return getList ({value: item});
	    case "text":
		return getParsedText ({value: item});
	}
    }).join ("")
}

function getHeading ({value}) {
    console.log ("Inside Get Heading: ", value);
    return `<h${value.level}>${getParsedValue ({value})}</h${value.level}>`
}


function getParsedText ({value}) {
    console.log ("Inside getParsedText: ", value)
    const bold = value.bold ? "font-weight:700;" : "";
    const italic = value.italic ? "font-style:italic;" : "";
    return `<span style=${bold.concat (italic)}>${value.value}</span>`
}
