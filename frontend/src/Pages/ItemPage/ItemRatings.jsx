import React from 'react';
import StarIcon from '@mui/icons-material/Star';  // For filled stars
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';  // For unfilled stars
import "./ItemRatings.css";

const ItemRatings = (props) => {
    const avgRating = props.average_rating || 0;  // Average rating (1 to 5)
    const ratingNumber = props.no_of_ratings;  // Number of ratings

    // Cap filled stars at 5 and handle fractional ratings
    const filledStars = Math.min(5, Math.floor(avgRating));
    const emptyStars = 5 - filledStars;

    return (
        <div className="items__rating">
            {Array.from({ length: filledStars }, (_, i) => (
                <StarIcon key={`filled-${i}`} className="items__rating__start" />
            ))}

            {Array.from({ length: emptyStars }, (_, i) => (
                <StarBorderOutlinedIcon key={`empty-${i}`} className="items__rating__start--notfull" />
            ))}

            <span className="items__rating__text">
                {ratingNumber} ratings
            </span>
        </div>
    );
};

export default ItemRatings;
