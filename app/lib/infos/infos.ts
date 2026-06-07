import * as TYPES from '@/app/types/typeIndex';

//Info Content
// Type: General, Portfolio
// 3DModel: Optional
// Header
// Content:
    // Text
    // Pictures vor Gallery

export const websiteInfos: TYPES.Info = {
    type: 'General',
    header: 'Procedurally Generated Backyard',
    content: {
        text: 'Hello and welcome to my (tilllius) homepage! :-) It resembles a beautiful backyard with swifts flying around, just like my backyard in real life. The whole backyard and all the objects in it are procedurally generated, which means that you will be greeted with a different backyard every time you visit the page.' +
        'Besides this backyard being one of my creative coding projects itself, I want to use it as a platform to present my other projects. When you look into some of the windows of the houses, you will find some of my projects. By clicking on the windows, you can find out more about the projects and find links to the project pages. I hope you enjoy exploring the backyard and my projects!'
    }
}

export const growInfos: TYPES.Info = {
    type: 'Portfolio',
    model: 'grow',
    link: 'https://tilllius.org',
    header: 'Grow',
    content: {
        text: 'The Grow project was inspired by natural growing patterns and their usage in bandlogos. With grow I created a tool, that allows the user to draw any stroke and let growth imerge from it.'
    }
}