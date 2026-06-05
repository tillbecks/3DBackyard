import * as TYPES from '@/app/types/typeIndex';

export function InformationNote(info: TYPES.Info){
    const imageBasePath = '/info_pictures/';
    const concatPicturePaths = info.content.picturePaths ? info.content.picturePaths.map(path => imageBasePath + path) : [];

    return (
        <div className='flex flex-col p-10 gap-10 bg-white font-serif shadow-lg'>
            <h2 className='text-xl font-bold'>{info.header}</h2>
            <div className='flex flex-row gap-4'>
                <div className='basis-3'>
                    <p>{info.content.text}</p>
                </div>
                {info.content.picturePaths && info.content.picturePaths.length > 0 && (
                    <div className='basis-1 flex flex-col gap-4'>
                        {concatPicturePaths.map((path, index) => (
                            <img key={index} src={path} className='w-full h-auto' alt={`Information picture ${index + 1}`} />
                        ))}
                    </div>
                )}
            </div>            
        </div>
    );
}