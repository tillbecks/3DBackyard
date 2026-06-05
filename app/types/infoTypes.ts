export interface Info {
    type: 'General' | 'Portfolio';
    model?: string;
    link?: string;
    header: string;
    content: {
        text: string;
        picturePaths?: string[];
    };
}