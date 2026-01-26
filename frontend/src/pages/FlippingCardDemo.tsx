import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlippingCard } from "@/components/ui/flipping-card";

interface CardData {
  id: string;
  front: {
    imageSrc: string;
    imageAlt: string;
    title: string;
    description: string;
  };
  back: {
    description: string;
    buttonText: string;
  };
}

const cardsData: CardData[] = [
  {
    id: "student",
    front: {
      imageSrc: "https://www.euroschoolindia.com/blogs/wp-content/uploads/2023/04/qualities-of-a-good-student.jpg",
      imageAlt: "Student",
      title: "Student",
      description: "Access quality education and learning resources tailored for your growth.",
    },
    back: {
      description: "Join our student community to learn from industry experts, collaborate with peers, and unlock opportunities for your academic and professional development.",
      buttonText: "Join as Student",
    },
  },
  {
    id: "vendor",
    front: {
      imageSrc: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      imageAlt: "Vendor",
      title: "Vendor",
      description: "Expand your business and reach customers through our collaborative platform.",
    },
    back: {
      description: "Partner with us as a vendor to showcase your products and services, connect with potential customers, and grow your business in a supportive ecosystem.",
      buttonText: "Register as Vendor",
    },
  },
];

export default function FlippingCardDemo() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCardButtonClick = (cardId: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (cardId === "student") {
        navigate("/student/signup");
      } else if (cardId === "vendor") {
        navigate("/vendor-register");
      }
    }, 300);
  };

  return (
    <div className={`flex gap-4 flex-wrap justify-center items-center min-h-screen p-8 bg-black transition-all duration-500 ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
      {cardsData.map((card) => (
        <FlippingCard
          key={card.id}
          width={300}
          frontContent={<GenericCardFront data={card.front} />}
          backContent={<GenericCardBack data={card.back} cardId={card.id} onButtonClick={handleCardButtonClick} />}
        />
      ))}
    </div>
  );
}

interface GenericCardFrontProps {
  data: CardData["front"];
}

function GenericCardFront({ data }: GenericCardFrontProps) {
  return (
    <div className="flex flex-col h-full w-full p-4">
      <img
        src={data.imageSrc}
        alt={data.imageAlt}
        className="w-full h-40 object-cover rounded-md"
      />
      <div className="p-2">
        <h3 className="text-base font-semibold mt-2 text-white">{data.title}</h3>
        <p className="text-[13.5px] mt-2 text-neutral-100">
          {data.description}
        </p>
      </div>
    </div>
  );
}

interface GenericCardBackProps {
  data: CardData["back"];
  cardId: string;
  onButtonClick: (cardId: string) => void;
}

function GenericCardBack({ data, cardId, onButtonClick }: GenericCardBackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6">
      <p className="text-[13.5px] mt-2 text-neutral-100 text-center">
        {data.description}
      </p>
      <button onClick={() => onButtonClick(cardId)} className="mt-6 bg-white text-black px-4 py-2 rounded-md text-[13.5px] w-min whitespace-nowrap h-8 flex items-center justify-center font-semibold">
        {data.buttonText}
      </button>
    </div>
  );
}
