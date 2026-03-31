import { useState } from 'react';
import { motion } from 'motion/react';
import DetailsModal, { DetailsModalData } from './DetailsModal';

const traditions = [
  {
    id: 1,
    name: 'Pashmina Weaving',
    region: 'Kashmir',
    image: '/images/pashmina-weaving.png',
    desc: 'The intricate art of weaving fine cashmere wool.',
    longDescription: 'Pashmina is a fine variant of spun cashmere, the animal-hair fibre forming the downy undercoat of the Changthangi goat. The word pashm means "wool" in Persian, but in Kashmir, pashm referred to the raw unspun wool of domesticated Changthangi goats. In common parlance today, pashmina may refer either to the material or to the variant of the Kashmir shawl that is made from it.'
  },
  {
    id: 2,
    name: 'Blue Pottery',
    region: 'Jaipur',
    image: '/images/blue-pottery.png',
    desc: 'Traditional craft of Jaipur, recognized by its striking blue dye.',
    longDescription: 'Blue Pottery is widely recognized as a traditional craft of Jaipur, though it is Turko-Persian in origin. The name \'blue pottery\' comes from the eye-catching blue dye used to color the pottery. Jaipur blue pottery, made out of a similar frit material to Egyptian faience, is glazed and low-fired. No clay is used: the \'dough\' for the pottery is prepared by mixing quartz stone powder, powdered glass, Multani Mitti (Fuller\'s Earth), borax, gum and water.'
  },
  {
    id: 3,
    name: 'Madhubani Painting',
    region: 'Bihar',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Madhubani_Mahavidyas.jpg',
    desc: 'Folk painting style characterized by eye-catching geometrical patterns.',
    longDescription: 'Madhubani art (or Mithila painting) is a style of Hindu painting, practiced in the Mithila region of India and Nepal. It was named after Madhubani District of Bihar, India which is where it is originated. This painting is done with a variety of tools, including fingers, twigs, brushes, nib-pens, and matchsticks and using natural dyes and pigments. It is characterised by its eye-catching geometrical patterns.'
  },
  {
    id: 4,
    name: 'Kanchipuram Silk',
    region: 'Tamil Nadu',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Kanchipuram_silk_sareer.JPG/960px-Kanchipuram_silk_sareer.JPG',
    desc: 'Hand-woven silk sarees known for their rich colors and durability.',
    longDescription: 'A Kanchipuram silk sari is a type of silk sari made in the Kanchipuram region in Tamil Nadu, India. These saris are worn as bridal & special occasion saris by most women in Tamil Nadu, Kerala, Karnataka & Andhra Pradesh. It has been recognized as a Geographical indication by the Government of India in 2005–2006. As of 2008, an estimated 5,000 families were involved in sari production.'
  },
  {
    id: 5,
    name: 'Dhokra Art',
    region: 'Chhattisgarh',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Village_lady_grinding_ants_for_her_family.jpg/960px-Village_lady_grinding_ants_for_her_family.jpg',
    desc: 'Non-ferrous metal casting using the lost-wax casting technique.',
    longDescription: 'Dhokra (also spelt Dokra) is non-ferrous metal casting using the lost-wax casting technique. This sort of metal casting has been used in India for over 4,000 years and is still used. One of the earliest known lost wax artefacts is the dancing girl of Mohenjo-daro. The product of dhokra artisans are in great demand in domestic and foreign markets because of primitive simplicity, enchanting folk motifs and forceful form.'
  },
  {
    id: 6,
    name: 'Chikankari Embroidery',
    region: 'Lucknow',
    image: '/images/chikankari-embroidery.png',
    desc: 'Delicate and artfully done hand embroidery on a variety of textile fabrics.',
    longDescription: 'Chikan is a traditional embroidery style from Lucknow, India. Literally translated, the word means embroidery, and it is one of Lucknow\'s best known textile decoration styles. The market for local chikan is mainly in Chowk, Lucknow. There are references to Indian chikan work as early as the 3rd century BC by Megasthenes, who mentioned the use of flowered muslins by Indians.'
  },
];

export default function ArtisanTraditions() {
  const [selectedTradition, setSelectedTradition] = useState<DetailsModalData | null>(null);

  return (
    <section id="artisan-traditions" className="py-24 bg-indian-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
          >
            Artisan Traditions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Celebrate the timeless craftsmanship and rich heritage of Indian artisans.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {traditions.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
              onClick={() => setSelectedTradition({
                title: item.name,
                image: item.image,
                description: item.desc,
                longDescription: item.longDescription,
                location: item.region
              })}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 h-[350px]"
            >
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-orange-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-center">
                <span className="text-orange-200 text-sm font-bold uppercase tracking-widest mb-2">
                  {item.region}
                </span>
                <h3 className="text-2xl font-bold text-white mb-3 font-serif">{item.name}</h3>
                <p className="text-white/90 text-sm">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <DetailsModal 
        isOpen={!!selectedTradition} 
        onClose={() => setSelectedTradition(null)} 
        data={selectedTradition} 
      />
    </section>
  );
}
