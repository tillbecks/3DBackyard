import * as TYPES from '@/app/types/typeIndex';

export function InformationNote({info, size}: {info: TYPES.Info, size: {width: number, height: number}}) {
    const imageBasePath = '/info_pictures/';
    const concatPicturePaths = info.content.picturePaths ? info.content.picturePaths.map(path => imageBasePath + path) : [];

    return (
        //centered absolute div
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col p-10 gap-10 bg-white font-serif shadow-lg overflow-auto ' style={{width: `${size.width}vw`, height: `${size.height}vh`}}>
            <h2 className='text-xl font-bold text-center'>{info.header}</h2>
            <div className='flex flex-row gap-4 w-full h-full'>
                <div>
                    <p>{info.content.text}</p>
                </div>
                {info.content.picturePaths && info.content.picturePaths.length > 0 && (
                    <div className='flex flex-col gap-4 max-w-1/4'>
                        {concatPicturePaths.map((path, index) => (
                            <img key={index} src={path} className='w-full h-auto' alt={`Information picture ${index + 1}`} />
                        ))}
                    </div>
                )}
            </div>            
        </div>
    );
}