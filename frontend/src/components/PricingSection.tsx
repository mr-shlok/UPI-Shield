import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiStar } from 'react-icons/fi';

const PricingSection: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '₹999',
      period: '/month',
      description: 'Perfect for small businesses',
      features: [
        'Up to 1,000 transactions/month',
        'Real-time fraud detection',
        'Email alerts',
        'Basic reports',
        'Email support',
      ],
      highlighted: false,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Professional',
      price: '₹2,999',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Up to 10,000 transactions/month',
        'Advanced AI detection',
        'SMS & Email alerts',
        'Advanced analytics',
        'Priority support',
        'Custom risk rules',
        'API access',
      ],
      highlighted: true,
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited transactions',
        'Full AI suite',
        'Multi-channel alerts',
        'White-label reports',
        '24/7 dedicated support',
        'Custom integrations',
        'Compliance assistance',
        'On-premise deployment',
      ],
      highlighted: false,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Simple, <span className="text-gradient">Transparent Pricing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your business. All plans include our core security features.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (index + 1), duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 shadow-xl cursor-pointer"
            >

              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <FiStar className="text-yellow-300" /> MOST POPULAR
                </div>
              )}
              
              <div
                className={`bg-gray-800 rounded-2xl p-8 h-full border-2 ${
                  plan.highlighted
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/20'
                    : 'border-gray-700 shadow-lg'
                } hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300`}
              >
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end justify-center gap-1">
                    <span className={`text-5xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-400 mb-2">{plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <FiCheck className={`text-xl flex-shrink-0 mt-0.5 bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`} />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-12 p-6 bg-green-900/30 rounded-xl max-w-2xl mx-auto border border-green-500/30"
        >
          <h4 className="text-2xl font-bold text-green-400 mb-2">30-Day Money Back Guarantee</h4>
          <p className="text-green-300/90">
            Try UPI Shield risk-free. If you're not satisfied, get a full refund within 30 days.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
