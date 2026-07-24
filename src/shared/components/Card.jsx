const Card = ({ product }) => {

    const { title, productName, price, productPrice, image, description, productCategory } = product;
    const displayTitle = title || productName;
    const displayPrice = price || productPrice;
    const displayDesc = description || productCategory;
    
    return (
        <div className="
          w-80
          text-text-inverse
          dark:bg-neutral-950/70
          backdrop-blur-[2px]
          shadow-lg
          rounded-2xl
          overflow-hidden
          hover:shadow-black
          transition-shadow
          duration-700
        ">
            {image && (
            <img 
              src={image}
              alt={displayTitle}
              className="w-full h-48 object-contain bg-gray-100"
            />
            )}

            <div className="p-5 space-y-3">
                <h2 className="text-xl font-semibold">
                    {displayTitle}
                </h2>

                {displayDesc && (
                <p className="text-sm">
                    {displayDesc}
                </p>
                )}

                <p className="text-lg font-bold text-cyan-200">
                    {displayPrice?.toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default Card;
